<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Services\ClaudeService;
use App\Services\GeminiService;
use App\Services\OpenAIService;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AiRoutingPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';

    protected static ?string $navigationGroup = 'AI';

    protected static ?string $navigationLabel = 'AI Routing';

    protected static ?string $title = 'AI Provider Routing';

    protected static ?int $navigationSort = 3;

    protected static string $view = 'filament.pages.ai-routing';

    /** @var array<string, array{healthy: bool, disabled: bool, today_spend: float, budget: float, circuit_key: string}> */
    public array $providerStatus = [];

    /** @var array<string, list<string>> */
    public array $featureRoutes = [];

    public static function canAccess(): bool
    {
        return auth()->check() && auth()->user()?->hasAnyRole(['Superadmin', 'Operations Admin']);
    }

    public function mount(): void
    {
        $this->loadStatus();
    }

    public function toggleProvider(string $provider): void
    {
        $cacheKey = 'ai:provider:'.$provider.':disabled';

        if (Cache::get($cacheKey, false)) {
            Cache::forget($cacheKey);
            Notification::make()->title(ucfirst($provider).' provider enabled')->success()->send();
        } else {
            Cache::put($cacheKey, true, now()->addDay());
            Notification::make()->title(ucfirst($provider).' provider disabled for 24 hours')->warning()->send();
        }

        $this->loadStatus();
    }

    public function clearCircuitBreaker(string $provider): void
    {
        Cache::forget('circuit:'.$provider.':failures');
        Cache::forget('circuit:'.$provider.':open');

        Notification::make()->title(ucfirst($provider).' circuit breaker cleared')->success()->send();

        $this->loadStatus();
    }

    private function loadStatus(): void
    {
        $today = now()->toDateString();

        /** @var array<string, list<string>> $featureRoutes */
        $featureRoutes = [];
        $configRoutes = (array) config('ai.routes', []);
        foreach ($configRoutes as $feature => $providers) {
            $featureRoutes[(string) $feature] = array_values(array_map('strval', (array) $providers));
        }
        $this->featureRoutes = $featureRoutes;

        $providers = [
            'claude' => app(ClaudeService::class),
            'openai' => app(OpenAIService::class),
            'gemini' => app(GeminiService::class),
        ];

        foreach ($providers as $name => $provider) {
            $budget = (float) config('ai.providers.'.$name.'.daily_budget_usd', 0);

            $todaySpend = (float) DB::table('ai_call_log')
                ->where('provider', $name)
                ->whereDate('created_at', $today)
                ->sum('cost_usd');

            $this->providerStatus[$name] = [
                'healthy' => $provider->isHealthy(),
                'disabled' => (bool) Cache::get('ai:provider:'.$name.':disabled', false),
                'today_spend' => $todaySpend,
                'budget' => $budget,
                'circuit_key' => 'circuit:'.$name.':open',
            ];
        }
    }
}
