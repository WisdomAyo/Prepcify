<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class AiCostDashboardWidget extends Widget
{
    protected static string $view = 'filament.widgets.ai-cost-dashboard';

    protected static ?int $sort = 6;

    protected int|string|array $columnSpan = 'full';

    /** @var array<string, float> */
    public array $dailyByFeature = [];

    /** @var array<string, float> */
    public array $dailyByProvider = [];

    public float $todayTotal = 0.0;

    public float $projectedMonthly = 0.0;

    /** @var array<int, array{user_id: int, email: string|null, total: float}> */
    public array $topOutliers = [];

    /** @var array<int, array{date: string, total: float}> */
    public array $last7Days = [];

    public function mount(): void
    {
        $this->loadMetrics();
    }

    private function loadMetrics(): void
    {
        $today = now()->toDateString();

        // Daily spend by feature
        $byFeature = DB::table('ai_call_log')
            ->whereDate('created_at', $today)
            ->select('feature', DB::raw('SUM(cost_usd) as total'))
            ->groupBy('feature')
            ->get();

        foreach ($byFeature as $row) {
            $this->dailyByFeature[(string) $row->feature] = (float) $row->total;
            $this->todayTotal += (float) $row->total;
        }

        // Daily spend by provider
        $byProvider = DB::table('ai_call_log')
            ->whereDate('created_at', $today)
            ->select('provider', DB::raw('SUM(cost_usd) as total'))
            ->groupBy('provider')
            ->get();

        foreach ($byProvider as $row) {
            $this->dailyByProvider[(string) $row->provider] = (float) $row->total;
        }

        // Projected monthly
        $daysInMonth = (int) now()->daysInMonth;
        $dayOfMonth = (int) now()->day;
        if ($dayOfMonth > 0) {
            $spentThisMonth = (float) DB::table('ai_call_log')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('cost_usd');
            $this->projectedMonthly = round(($spentThisMonth / $dayOfMonth) * $daysInMonth, 4);
        }

        // Top 10 cost outliers (last 7 days)
        $this->topOutliers = DB::table('ai_call_log')
            ->leftJoin('users', 'ai_call_log.user_id', '=', 'users.id')
            ->where('ai_call_log.created_at', '>=', now()->subDays(7))
            ->whereNotNull('ai_call_log.user_id')
            ->select('ai_call_log.user_id', 'users.email', DB::raw('SUM(ai_call_log.cost_usd) as total'))
            ->groupBy('ai_call_log.user_id', 'users.email')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'user_id' => (int) $row->user_id,
                'email' => $row->email,
                'total' => (float) $row->total,
            ])
            ->toArray();

        // Last 7 days trend
        $this->last7Days = DB::table('ai_call_log')
            ->where('created_at', '>=', now()->subDays(7))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(cost_usd) as total'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => ['date' => (string) $row->date, 'total' => (float) $row->total])
            ->toArray();
    }
}
