<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\AIProvider;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\AiFeature;
use Generator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AIRouter
{
    /**
     * Synchronous completion with automatic provider selection and fallback.
     *
     * @param  array<string, mixed>  $opts
     */
    public function complete(
        AiFeature $feature,
        string $system,
        string $user,
        ?int $userId = null,
        array $opts = [],
    ): AIResponse {
        $lastError = new RuntimeException('No provider available for feature: '.$feature->value);
        $fallbackFrom = null;

        foreach ($this->getOrderedProviders($feature, $opts) as $providerName => $provider) {
            try {
                $callOpts = array_merge($opts, [
                    'feature' => $feature,
                    'user_id' => $userId,
                    'fallback_from' => $fallbackFrom,
                ]);

                $response = $provider->complete($system, $user, $callOpts);

                if ($fallbackFrom !== null) {
                    Log::info("AIRouter: fallback succeeded via {$providerName} after {$fallbackFrom} failed", [
                        'feature' => $feature->value,
                    ]);
                }

                return $response;
            } catch (\Throwable $e) {
                Log::warning("AIRouter: provider {$providerName} failed for {$feature->value}: ".$e->getMessage());
                $lastError = $e;
                $fallbackFrom = $providerName;
            }
        }

        throw new RuntimeException(
            'All AI providers failed for feature '.$feature->value.': '.$lastError->getMessage(),
            0,
            $lastError,
        );
    }

    /**
     * Streaming completion with automatic provider selection and fallback.
     * Fallback happens only if the provider throws before yielding the first chunk.
     *
     * @param  array<string, mixed>  $opts
     * @return Generator<int, string, mixed, void>
     */
    public function completeStream(
        AiFeature $feature,
        string $system,
        string $user,
        ?int $userId = null,
        array $opts = [],
    ): Generator {
        $lastError = new RuntimeException('No provider available for feature: '.$feature->value);
        $fallbackFrom = null;

        foreach ($this->getOrderedProviders($feature, $opts) as $providerName => $provider) {
            $callOpts = array_merge($opts, [
                'feature' => $feature,
                'user_id' => $userId,
                'fallback_from' => $fallbackFrom,
            ]);

            $gen = $provider->completeStream($system, $user, $callOpts);

            try {
                // rewind() runs the generator body up to the first yield, triggering
                // the HTTP call. If the HTTP call throws, we can still try the next provider.
                $gen->rewind();
            } catch (\Throwable $e) {
                Log::warning("AIRouter: stream provider {$providerName} failed for {$feature->value}: ".$e->getMessage());
                $lastError = $e;
                $fallbackFrom = $providerName;

                continue;
            }

            if ($fallbackFrom !== null) {
                Log::info("AIRouter: stream fallback succeeded via {$providerName} after {$fallbackFrom} failed", [
                    'feature' => $feature->value,
                ]);
            }

            // First chunk is ready — yield it and continue the generator
            while ($gen->valid()) {
                yield $gen->current();
                $gen->next();
            }

            return;
        }

        throw new RuntimeException(
            'All AI stream providers failed for feature '.$feature->value.': '.$lastError->getMessage(),
            0,
            $lastError,
        );
    }

    /**
     * Returns providers in configured preference order, skipping disabled/unhealthy/over-budget ones.
     *
     * @param  array<string, mixed>  $opts
     * @return iterable<string, AIProvider>
     */
    private function getOrderedProviders(AiFeature $feature, array $opts = []): iterable
    {
        $route = config('ai.routes.'.$feature->value, ['claude']);

        if (isset($opts['preferred_provider']) && is_string($opts['preferred_provider'])) {
            $preferred = $opts['preferred_provider'];
            if (in_array($preferred, $route, true)) {
                $route = array_values(array_unique(array_merge([$preferred], $route)));
            }
        }

        foreach ($route as $providerName) {
            $providerConfig = config('ai.providers.'.$providerName);

            if (! is_array($providerConfig)) {
                continue;
            }

            // Runtime disable flag (set via cache by the AI Routing admin page)
            if (! $this->isProviderEnabled($providerName)) {
                continue;
            }

            // Circuit breaker / health check
            /** @var class-string<AIProvider> $class */
            $class = $providerConfig['class'];
            $provider = app($class);

            try {
                if (! $provider->isHealthy()) {
                    Log::debug("AIRouter: skipping {$providerName} — circuit breaker open");

                    continue;
                }
            } catch (\Throwable) {
                // Health check itself threw (e.g. partial mock in tests) — assume healthy
            }

            // Daily budget cap
            if ($this->isDailyBudgetExceeded($providerName, (float) ($providerConfig['daily_budget_usd'] ?? 0))) {
                Log::warning("AIRouter: skipping {$providerName} — daily budget exceeded");

                continue;
            }

            yield $providerName => $provider;
        }
    }

    private function isProviderEnabled(string $providerName): bool
    {
        // Static config flag (env-driven)
        if (! config('ai.providers.'.$providerName.'.enabled', true)) {
            return false;
        }

        // Runtime disable via cache (toggled from AI Routing admin page)
        return ! Cache::get('ai:provider:'.$providerName.':disabled', false);
    }

    private function isDailyBudgetExceeded(string $providerName, float $budget): bool
    {
        if ($budget <= 0.0) {
            return false;
        }

        $spent = (float) DB::table('ai_call_log')
            ->where('provider', $providerName)
            ->whereDate('created_at', today())
            ->sum('cost_usd');

        return $spent >= $budget;
    }
}
