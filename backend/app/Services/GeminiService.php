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

class GeminiService implements AIProvider
{
    private const TIMEOUT_SECONDS = 30;

    private const MAX_RETRIES = 3;

    private const RETRY_DELAY_MS = 500;

    private const CIRCUIT_FAILURES_KEY = 'circuit:gemini:failures';

    private const CIRCUIT_OPEN_KEY = 'circuit:gemini:open';

    private const CIRCUIT_FAILURE_THRESHOLD = 5;

    private const CIRCUIT_FAILURE_WINDOW_SECONDS = 60;

    private const CIRCUIT_OPEN_DURATION_SECONDS = 300;

    private const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

    private const COST_PER_MODEL = [
        'gemini-2.5-pro' => ['input' => 0.00000125, 'output' => 0.00001],
        'gemini-2.0-flash' => ['input' => 0.0000001, 'output' => 0.0000004],
    ];

    private const DEFAULT_COST_INPUT = 0.00000125;

    private const DEFAULT_COST_OUTPUT = 0.00001;

    private string $apiKey;

    private string $defaultModel;

    public function __construct()
    {
        $this->apiKey = (string) config('ai.providers.gemini.api_key', '');
        $this->defaultModel = (string) config('ai.providers.gemini.default_model', 'gemini-2.5-pro');
    }

    public function name(): string
    {
        return 'gemini';
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
                $url = self::API_BASE."/{$model}:generateContent?key={$this->apiKey}";

                $response = Http::timeout(self::TIMEOUT_SECONDS)
                    ->post($url, [
                        'systemInstruction' => ['parts' => [['text' => $system]]],
                        'contents' => [['role' => 'user', 'parts' => $this->buildUserParts($user, $opts)]],
                        'generationConfig' => ['maxOutputTokens' => $maxTokens],
                    ]);

                if ($response->serverError()) {
                    throw new RuntimeException('Gemini API server error: '.$response->status());
                }

                $data = $response->json();
                $text = (string) ($data['candidates'][0]['content']['parts'][0]['text'] ?? '');
                $inputTokens = (int) ($data['usageMetadata']['promptTokenCount'] ?? 0);
                $outputTokens = (int) ($data['usageMetadata']['candidatesTokenCount'] ?? 0);
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

        throw new RuntimeException('Gemini API failed after '.self::MAX_RETRIES.' attempts: '.$lastError->getMessage());
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
            // Gemini streaming endpoint uses :streamGenerateContent
            $url = self::API_BASE."/{$model}:streamGenerateContent?alt=sse&key={$this->apiKey}";

            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->post($url, [
                    'systemInstruction' => ['parts' => [['text' => $system]]],
                    'contents' => [['role' => 'user', 'parts' => [['text' => $user]]]],
                    'generationConfig' => ['maxOutputTokens' => $maxTokens],
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

                $chunk = (string) ($json['candidates'][0]['content']['parts'][0]['text'] ?? '');
                if ($chunk !== '') {
                    $outputTokens++;
                    yield $chunk;
                }

                if (isset($json['usageMetadata'])) {
                    $inputTokens = (int) ($json['usageMetadata']['promptTokenCount'] ?? $inputTokens);
                    $outputTokens = (int) ($json['usageMetadata']['candidatesTokenCount'] ?? $outputTokens);
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
            throw new RuntimeException('Gemini API circuit breaker is open — service temporarily unavailable.');
        }
    }

    /**
     * @param  array<string, mixed>  $opts
     * @return array<int, array<string, mixed>>
     */
    private function buildUserParts(string $user, array $opts): array
    {
        $parts = [['text' => $user]];

        if (isset($opts['image_base64']) && is_string($opts['image_base64'])) {
            $parts[] = [
                'inlineData' => [
                    'mimeType' => is_string($opts['image_mime_type'] ?? null) ? $opts['image_mime_type'] : 'image/png',
                    'data' => $opts['image_base64'],
                ],
            ];
        }

        return $parts;
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
            Log::warning('Gemini circuit breaker opened after '.$failures.' failures in the last minute.');
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
