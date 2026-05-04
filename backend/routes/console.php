<?php

declare(strict_types=1);

use App\Jobs\DailyMissionAssignmentJob;
use App\Jobs\WeeklyLeagueResolutionJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new WeeklyLeagueResolutionJob)->weekly()->sundays()->at('23:50')->timezone('UTC');
Schedule::job(new DailyMissionAssignmentJob)->daily()->at('00:05')->timezone('UTC');
