<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\LeagueService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class WeeklyLeagueResolutionJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct()
    {
        $this->onQueue('default');
    }

    public function handle(LeagueService $leagueService): void
    {
        $leagueService->resolveWeeklyLeagues();
    }
}
