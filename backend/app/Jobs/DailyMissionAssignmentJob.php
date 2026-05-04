<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\User;
use App\Services\MissionService;
use App\Support\Enums\UserType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DailyMissionAssignmentJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct()
    {
        $this->onQueue('default');
    }

    public function handle(MissionService $missionService): void
    {
        User::where('user_type', UserType::Student->value)
            ->whereNotNull('email_verified_at')
            ->chunkById(200, function ($users) use ($missionService) {
                foreach ($users as $user) {
                    $missionService->assignDailyMissions($user);
                }
            });
    }
}
