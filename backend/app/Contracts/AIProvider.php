<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Support\DataTransferObjects\AIResponse;
use Generator;

interface AIProvider
{
    /**
     * Synchronous completion — returns the full assistant response.
     *
     * @param  array<string, mixed>  $opts  Accepted keys: model, max_tokens, feature (AiFeature), user_id, fallback_from
     */
    public function complete(string $system, string $user, array $opts = []): AIResponse;

    /**
     * Streaming completion — yields text chunks.
     *
     * @param  array<string, mixed>  $opts  Same as complete()
     * @return Generator<int, string, mixed, void>
     */
    public function completeStream(string $system, string $user, array $opts = []): Generator;

    /** Provider identifier string, e.g. 'claude', 'openai', 'gemini'. */
    public function name(): string;

    /** Returns false when the circuit breaker is open. */
    public function isHealthy(): bool;

    /** Estimate cost in USD for given token counts and model. */
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): float;
}
