<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;

class AchievementService
{
    public function __construct(private readonly XpService $xpService) {}

    /** @param array<string, mixed> $context */
    public function checkAndAward(User $user, string $event, array $context = []): void
    {
        $achievements = Achievement::where(function ($query) use ($event) {
            $query->whereJsonContains('criteria->trigger', $event)
                ->orWhereJsonContains('criteria->type', $event);
        })->get();

        foreach ($achievements as $achievement) {
            if ($this->alreadyEarned($user, $achievement->id)) {
                continue;
            }

            if ($this->criteriaMet($achievement->criteria, $context)) {
                UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'earned_at' => now(),
                ]);

                $rewardXp = $achievement->criteria['reward_xp'] ?? 50;
                $this->xpService->award($user, (int) $rewardXp, 'achievement:'.$achievement->code);
            }
        }
    }

    private function alreadyEarned(User $user, int $achievementId): bool
    {
        return UserAchievement::where('user_id', $user->id)
            ->where('achievement_id', $achievementId)
            ->exists();
    }

    /** @param array<string, mixed> $criteria
     * @param array<string, mixed> $context */
    private function criteriaMet(array $criteria, array $context): bool
    {
        if (isset($criteria['threshold']) && isset($context['value'])) {
            return (int) $context['value'] >= (int) $criteria['threshold'];
        }

        return true;
    }
}
