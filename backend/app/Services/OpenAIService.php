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

class OpenAIService implements AIProvider
{
    private const TIMEOUT_SECONDS = 30;

    private const MAX_RETRIES = 3;

    private const RETRY_DELAY_MS = 500;

    private const CIRCUIT_FAILURES_KEY = 'circuit:openai:failures';

    private const CIRCUIT_OPEN_KEY = 'circuit:openai:open';

    private const CIRCUIT_FAILURE_THRESHOLD = 5;

    private const CIRCUIT_FAILURE_WINDOW_SECONDS = 60;

    private const CIRCUIT_OPEN_DURATION_SECONDS = 300;

    private const COST_PER_MODEL = [
        'gpt-4o' => ['input' => 0.000005, 'output' => 0.000015],
        'gpt-4o-mini' => ['input' => 0.00000015, 'output' => 0.0000006],
    ];

    private const DEFAULT_COST_INPUT = 0.000005;

    private const DEFAULT_COST_OUTPUT = 0.000015;

    private string $apiKey;

    private string $defaultModel;

    public function __construct()
    {
        $this->apiKey = (string) config('ai.providers.openai.api_key', '');
        $this->defaultModel = (string) config('ai.providers.openai.default_model', 'gpt-4o');
    }

    public function name(): string
    {
        return 'openai';
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
     * @param  array<string, mixed>  $opts
     */
    public function complete(string $system, string $user, array $opts = []): AIResponse
    {
        $this->assertCircuitClosed();

        $feature = $opts['feature'] ?? AiFeature::Explanation;
        $userId = isset($opts['user_id']) ? (int) $opts['user_id'] : null;
        $fallbackFrom = isset($opts['fallback_from']) ? (string) $opts['fallback_from'] : null;
        $model = (string) ($opts['model'] ?? $this->defaultModel);
        $maxTokens = (int) ($opts['max_tokens'] ?? 4096);
        $startMs = (int) round(microtime(true) * 1000);

        $lastError = new RuntimeException('No attempts made');

        $attempt = 0;
        while ($attempt < self::MAX_RETRIES) {
            try {
                $userContent = $this->buildUserContent($user, $opts);

                $response = Http::withToken($this->apiKey)
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => $model,
                        'max_tokens' => $maxTokens,
                        'messages' => [
                            ['role' => 'system', 'content' => $system],
                            ['role' => 'user', 'content' => $userContent],
                        ],
                    ]);

                if ($response->serverError()) {
                    throw new RuntimeException('OpenAI API server error: '.$response->status());
                }

                $data = $response->json();
                $text = (string) ($data['choices'][0]['message']['content'] ?? '');
                $inputTokens = (int) ($data['usage']['prompt_tokens'] ?? 0);
                $outputTokens = (int) ($data['usage']['completion_tokens'] ?? 0);
                $durationMs = (int) round(microtime(true) * 1000) - $startMs;

                $cost = $this->estimateCost($inputTokens, $outputTokens, $model);
                $this->logCall($userId, $feature, $model, $inputTokens, $outputTokens, $durationMs, true, null, $fallbackFrom);
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
        $this->logCall($userId, $feature, $model, 0, 0, $durationMs, false, $lastError->getMessage(), $fallbackFrom);
        $this->recordFailure();

        throw new RuntimeException('OpenAI API failed after '.self::MAX_RETRIES.' attempts: '.$lastError->getMessage());
    }

    /**
     * @param  array<string, mixed>  $opts
     * @return Generator<int, string, mixed, void>
     */
    public function completeStream(string $system, string $user, array $opts = []): Generator
    {
        $this->assertCircuitClosed();

        $feature = $opts['feature'] ?? AiFeature::Explanation;
        $userId = isset($opts['user_id']) ? (int) $opts['user_id'] : null;
        $fallbackFrom = isset($opts['fallback_from']) ? (string) $opts['fallback_from'] : null;
        $model = (string) ($opts['model'] ?? $this->defaultModel);
        $maxTokens = (int) ($opts['max_tokens'] ?? 4096);
        $startMs = (int) round(microtime(true) * 1000);

        try {
            $response = Http::withToken($this->apiKey)
                ->withHeaders(['Accept' => 'text/event-stream'])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'max_tokens' => $maxTokens,
                    'stream' => true,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $user],
                    ],
                ]);

            $inputTokens = 0;
            $outputTokens = 0;

            foreach (explode("\n", $response->body()) as $line) {
                if (! str_starts_with($line, 'data: ')) {
                    continue;
                }

                $payload = substr($line, 6);
                if (trim($payload) === '[DONE]') {
                    break;
                }

                $json = json_decode($payload, true);

                if (! is_array($json)) {
                    continue;
                }

                $chunk = (string) ($json['choices'][0]['delta']['content'] ?? '');
                if ($chunk !== '') {
                    $outputTokens++;
                    yield $chunk;
                }

                if (isset($json['usage']['prompt_tokens'])) {
                    $inputTokens = (int) $json['usage']['prompt_tokens'];
                    $outputTokens = (int) ($json['usage']['completion_tokens'] ?? $outputTokens);
                }
            }

            $durationMs = (int) round(microtime(true) * 1000) - $startMs;
            $this->logCall($userId, $feature, $model, $inputTokens, $outputTokens, $durationMs, true, null, $fallbackFrom);
            $this->recordSuccess();
        } catch (\Throwable $e) {
            $durationMs = (int) round(microtime(true) * 1000) - $startMs;
            $this->logCall($userId, $feature, $model, 0, 0, $durationMs, false, $e->getMessage(), $fallbackFrom);
            $this->recordFailure();
            throw $e;
        }
    }

    private function assertCircuitClosed(): void
    {
        if (Cache::get(self::CIRCUIT_OPEN_KEY, false)) {
            throw new RuntimeException('OpenAI API circuit breaker is open — service temporarily unavailable.');
        }
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

        $mimeType = is_string($opts['image_mime_type'] ?? null) ? $opts['image_mime_type'] : 'image/png';

        return [
            ['type' => 'text', 'text' => $user],
            [
                'type' => 'image_url',
                'image_url' => ['url' => "data:{$mimeType};base64,{$opts['image_base64']}"],
            ],
        ];
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
            Log::warning('OpenAI circuit breaker opened after '.$failures.' failures in the last minute.');
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
        ?string $fallbackFrom = null,
    ): void {
        try {
            AiCallLog::create([
                'user_id' => $userId,
                'feature' => $feature->value,
                'model' => $model,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'cost_usd' => round($this->estimateCost($inputTokens, $outputTokens, $model), 6),
                'duration_ms' => $durationMs,
                'succeeded' => $succeeded,
                'error' => $error,
                'provider' => $this->name(),
                'fallback_from' => $fallbackFrom,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to write AI call log: '.$e->getMessage());
        }
    }
}
