<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Mission;
use App\Models\User;
use App\Models\UserMission;
use App\Support\Enums\MissionRecurrence;
use Carbon\Carbon;

class MissionService
{
    public function __construct(private readonly XpService $xpService) {}

    public function assignDailyMissions(User $user): void
    {
        $periodKey = Carbon::now()->toDateString();

        $missions = Mission::where('recurrence', MissionRecurrence::Daily->value)
            ->whereNull('exam_body_id')
            ->limit(3)
            ->get();

        foreach ($missions as $mission) {
            UserMission::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'mission_id' => $mission->id,
                    'period_key' => $periodKey,
                ],
                [
                    'progress' => 0,
                    'target' => $mission->target,
                    'completed_at' => null,
                ],
            );
        }
    }

    public function recordProgress(User $user, string $missionCode, int $increment = 1): void
    {
        $mission = Mission::where('code', $missionCode)->first();

        if ($mission === null) {
            return;
        }

        $periodKey = $this->currentPeriodKey($mission->recurrence);

        $userMission = UserMission::where('user_id', $user->id)
            ->where('mission_id', $mission->id)
            ->where('period_key', $periodKey)
            ->first();

        if ($userMission === null || $userMission->completed_at !== null) {
            return;
        }

        $userMission->progress = max(0, min($userMission->target, (int) $userMission->progress + $increment));

        if ($userMission->progress >= $userMission->target) {
            $userMission->completed_at = now();
        }

        $userMission->save();
    }

    public function claimReward(User $user, int $userMissionId): UserMission
    {
        $userMission = UserMission::where('id', $userMissionId)
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->firstOrFail();

        $mission = $userMission->mission()->firstOrFail();

        $this->xpService->award($user, $mission->reward_xp, 'mission:'.$mission->code);

        return $userMission;
    }

    private function currentPeriodKey(MissionRecurrence $recurrence): string
    {
        return match ($recurrence) {
            MissionRecurrence::Daily => Carbon::now()->toDateString(),
            MissionRecurrence::Weekly => Carbon::now()->startOfWeek()->toDateString(),
            MissionRecurrence::Once => 'once',
        };
    }
}
