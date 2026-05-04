<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\AIProvider;
use App\Models\AiCallLog;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\AiFeature;
use Generator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ClaudeService implements AIProvider
{
    private const TIMEOUT_SECONDS = 30;

    private const MAX_RETRIES = 3;

    private const RETRY_DELAY_MS = 500;

    private const CIRCUIT_FAILURES_KEY = 'circuit:claude:failures';

    private const CIRCUIT_OPEN_KEY = 'circuit:claude:open';

    private const CIRCUIT_FAILURE_THRESHOLD = 5;

    private const CIRCUIT_FAILURE_WINDOW_SECONDS = 60;

    private const CIRCUIT_OPEN_DURATION_SECONDS = 300;

    private const COST_PER_MODEL = [
        'claude-opus-4-7' => ['input' => 0.000015, 'output' => 0.000075],
        'claude-sonnet-4-6' => ['input' => 0.000003, 'output' => 0.000015],
        'claude-haiku-4-5' => ['input' => 0.0000008, 'output' => 0.000004],
    ];

    private const DEFAULT_COST_INPUT = 0.000003;

    private const DEFAULT_COST_OUTPUT = 0.000015;

    private string $apiKey;

    private string $defaultModel;

    public function __construct()
    {
        $this->apiKey = (string) config('ai.providers.claude.api_key', config('services.anthropic.api_key', ''));
        $this->defaultModel = (string) config('ai.providers.claude.default_model', 'claude-sonnet-4-6');
    }

    public function name(): string
    {
        return 'claude';
    }

    public function isHealthy(): bool
    {
        return ! Cache::get(self::CIRCUIT_OPEN_KEY, false);
    }

    public function estimateCost(int $inputTokens, int $outputTokens, string $model): float
    {
        $rates = self::COST_PER_MODEL[$model] ?? ['input' => self::DEFAULT_COST_INPUT, 'output' => self::DEFAULT_COST_OUTPUT];

        return round(($inputTokens * $rates['input']) + ($outputTokens * $rates['output']), 6);
    }

    /**
     * AIProvider interface: synchronous completion.
     *
     * @param  array<string, mixed>  $opts
     */
    public function complete(string $system, string $user, array $opts = []): AIResponse
    {
        $feature = $opts['feature'] ?? AiFeature::Explanation;
        $userId = isset($opts['user_id']) ? (int) $opts['user_id'] : null;
        $fallbackFrom = isset($opts['fallback_from']) ? (string) $opts['fallback_from'] : null;

        return $this->completeWithMetadata($system, $user, $feature, $userId, $opts, $fallbackFrom);
    }

    /**
     * AIProvider interface: streaming completion — yields text chunks.
     *
     * @param  array<string, mixed>  $opts
     * @return Generator<int, string, mixed, void>
     */
    public function completeStream(string $system, string $user, array $opts = []): Generator
    {
        $feature = $opts['feature'] ?? AiFeature::Explanation;
        $userId = isset($opts['user_id']) ? (int) $opts['user_id'] : null;
        $fallbackFrom = isset($opts['fallback_from']) ? (string) $opts['fallback_from'] : null;

        yield from $this->streamInternal($system, $user, $feature, $userId, $opts, $fallbackFrom);
    }

    /**
     * Legacy synchronous API kept for backwards compatibility and direct ClaudeService tests.
     * New code should use complete() via AIRouter.
     *
     * @param  array<string, mixed>  $opts
     */
    public function completeOnce(
        string $system,
        string $user,
        AiFeature $feature,
        ?int $userId = null,
        array $opts = [],
        ?string $fallbackFrom = null,
    ): string {
        return $this->completeWithMetadata($system, $user, $feature, $userId, $opts, $fallbackFrom)->content;
    }

    /**
     * @param  array<string, mixed>  $opts
     */
    private function completeWithMetadata(
        string $system,
        string $user,
        AiFeature $feature,
        ?int $userId = null,
        array $opts = [],
        ?string $fallbackFrom = null,
    ): AIResponse {
        $this->assertCircuitClosed();

        $model = (string) ($opts['model'] ?? $this->defaultModel);
        $maxTokens = (int) ($opts['max_tokens'] ?? 4096);
        $startMs = (int) round(microtime(true) * 1000);

        $lastError = new RuntimeException('No attempts made');

        $attempt = 0;
        while ($attempt < self::MAX_RETRIES) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->post('https://api.anthropic.com/v1/messages', [
                        'model' => $model,
                        'max_tokens' => $maxTokens,
                        'system' => $system,
                        'messages' => [['role' => 'user', 'content' => $this->buildUserContent($user, $opts)]],
                    ]);

                if ($response->serverError()) {
                    throw new RuntimeException('Claude API server error: '.$response->status());
                }

                $data = $response->json();
                $text = (string) ($data['content'][0]['text'] ?? '');
                $inputTokens = (int) ($data['usage']['input_tokens'] ?? 0);
                $outputTokens = (int) ($data['usage']['output_tokens'] ?? 0);
                $durationMs = (int) round(microtime(true) * 1000) - $startMs;
                $cost = $this->estimateCost($inputTokens, $outputTokens, $model);

                $this->logCall($userId, $feature, $model, $inputTokens, $outputTokens, $durationMs, true, null, $this->name(), $fallbackFrom);
                $this->recordSuccess();

                return new AIResponse(
                    content: $text,
                    model: $model,
                    inputTokens: $inputTokens,
                    outputTokens: $outputTokens,
                    cost: $cost,
                    provider: $this->name(),
                    durationMs: $durationMs,
                );
            } catch (ConnectionException $e) {
                $lastError = $e;
                $attempt++;
                if ($attempt < self::MAX_RETRIES) {
                    usleep(self::RETRY_DELAY_MS * 1000 * (2 ** ($attempt - 1)));
                }
            } catch (RuntimeException $e) {
                $lastError = $e;
                $attempt++;
                if ($attempt < self::MAX_RETRIES) {
                    usleep(self::RETRY_DELAY_MS * 1000 * (2 ** ($attempt - 1)));
                }
            }
        }

        $durationMs = (int) round(microtime(true) * 1000) - $startMs;
        $errorMsg = $lastError->getMessage();
        $this->logCall($userId, $feature, $model, 0, 0, $durationMs, false, $errorMsg, $this->name(), $fallbackFrom);
        $this->recordFailure();

        throw new RuntimeException('Claude API failed after '.self::MAX_RETRIES.' attempts: '.$errorMsg);
    }

    /**
     * @param  array<string, mixed>  $opts
     * @return string|array<int, array<string, mixed>>
     */
    private function buildUserContent(string $user, array $opts): string|array
    {
        if (! isset($opts['image_base64']) || ! is_string($opts['image_base64'])) {
            return $user;
        }

        return [
            ['type' => 'text', 'text' => $user],
            [
                'type' => 'image',
                'source' => [
                    'type' => 'base64',
                    'media_type' => is_string($opts['image_mime_type'] ?? null) ? $opts['image_mime_type'] : 'image/png',
                    'data' => $opts['image_base64'],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $opts
     * @return Generator<int, string, mixed, void>
     */
    private function streamInternal(
        string $system,
        string $user,
        AiFeature $feature,
        ?int $userId,
        array $opts,
        ?string $fallbackFrom,
    ): Generator {
        $this->assertCircuitClosed();

        $model = (string) ($opts['model'] ?? $this->defaultModel);
        $maxTokens = (int) ($opts['max_tokens'] ?? 4096);
        $startMs = (int) round(microtime(true) * 1000);

        try {
            $response = Http::withToken($this->apiKey)
                ->withHeaders(['Accept' => 'text/event-stream'])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => $model,
                    'max_tokens' => $maxTokens,
                    'stream' => true,
                    'system' => $system,
                    'messages' => [['role' => 'user', 'content' => $user]],
                ]);

            $inputTokens = 0;
            $outputTokens = 0;

            foreach (explode("\n", $response->body()) as $line) {
                if (! str_starts_with($line, 'data: ')) {
                    continue;
                }

                $json = json_decode(substr($line, 6), true);

                if (! is_array($json)) {
                    continue;
                }

                if (($json['type'] ?? '') === 'content_block_delta') {
                    $chunk = (string) ($json['delta']['text'] ?? '');
                    if ($chunk !== '') {
                        $outputTokens++;
                        yield $chunk;
                    }
                }

                if (($json['type'] ?? '') === 'message_delta') {
                    $outputTokens = (int) ($json['usage']['output_tokens'] ?? $outputTokens);
                }

                if (($json['type'] ?? '') === 'message_start') {
                    $inputTokens = (int) ($json['message']['usage']['input_tokens'] ?? 0);
                }
            }

            $durationMs = (int) round(microtime(true) * 1000) - $startMs;
            $this->logCall($userId, $feature, $model, $inputTokens, $outputTokens, $durationMs, true, null, $this->name(), $fallbackFrom);
            $this->recordSuccess();
        } catch (\Throwable $e) {
            $durationMs = (int) round(microtime(true) * 1000) - $startMs;
            $this->logCall($userId, $feature, $model, 0, 0, $durationMs, false, $e->getMessage(), $this->name(), $fallbackFrom);
            $this->recordFailure();
            throw $e;
        }
    }

    private function assertCircuitClosed(): void
    {
        if (Cache::get(self::CIRCUIT_OPEN_KEY, false)) {
            throw new RuntimeException('Claude API circuit breaker is open — service temporarily unavailable.');
        }
    }

    private function recordSuccess(): void
    {
        Cache::forget(self::CIRCUIT_FAILURES_KEY);
    }

    private function recordFailure(): void
    {
        $failures = (int) Cache::get(self::CIRCUIT_FAILURES_KEY, 0) + 1;
        Cache::put(self::CIRCUIT_FAILURES_KEY, $failures, self::CIRCUIT_FAILURE_WINDOW_SECONDS);

        if ($failures >= self::CIRCUIT_FAILURE_THRESHOLD) {
            Cache::put(self::CIRCUIT_OPEN_KEY, true, self::CIRCUIT_OPEN_DURATION_SECONDS);
            Cache::forget(self::CIRCUIT_FAILURES_KEY);
            Log::warning('Claude circuit breaker opened after '.$failures.' failures in the last minute.');
        }
    }

    private function logCall(
        ?int $userId,
        AiFeature $feature,
        string $model,
        int $inputTokens,
        int $outputTokens,
        int $durationMs,
        bool $succeeded,
        ?string $error,
        string $provider = 'claude',
        ?string $fallbackFrom = null,
    ): void {
        try {
            $cost = $this->estimateCost($inputTokens, $outputTokens, $model);

            AiCallLog::create([
                'user_id' => $userId,
                'feature' => $feature->value,
                'model' => $model,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'cost_usd' => round($cost, 6),
                'duration_ms' => $durationMs,
                'succeeded' => $succeeded,
                'error' => $error,
                'provider' => $provider,
                'fallback_from' => $fallbackFrom,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to write AI call log: '.$e->getMessage());
        }
    }
}
