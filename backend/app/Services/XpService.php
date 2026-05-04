<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\UserXp;
use Carbon\Carbon;

class XpService
{
    private const LEVEL_XP_BASE = 100;

    private const LEVEL_XP_MULTIPLIER = 1.5;

    /** @param array<string, mixed> $_metadata */
    public function award(User $user, int $amount, string $_reason, array $_metadata = []): UserXp
    {
        $weekStart = Carbon::now()->startOfWeek();

        $xp = UserXp::firstOrNew(['user_id' => $user->id]);

        if (! $xp->exists) {
            $xp->fill([
                'user_id' => $user->id,
                'total_xp' => 0,
                'level' => 1,
                'xp_this_week' => 0,
                'week_starts_at' => $weekStart,
            ]);
        }

        if ($xp->week_starts_at?->toDateString() !== $weekStart->toDateString()) {
            $xp->xp_this_week = 0;
            $xp->week_starts_at = $weekStart;
        }

        $newTotal = max(0, (int) $xp->total_xp + $amount);
        $newWeekly = max(0, (int) $xp->xp_this_week + $amount);

        $xp->total_xp = $newTotal;
        $xp->xp_this_week = $newWeekly;
        $xp->level = $this->computeLevel($newTotal);
        $xp->updated_at = now();
        $xp->save();

        return $xp;
    }

    public function getXp(User $user): UserXp
    {
        return UserXp::firstOrNew(
            ['user_id' => $user->id],
            [
                'total_xp' => 0,
                'level' => 1,
                'xp_this_week' => 0,
            ],
        );
    }

    /** @return positive-int */
    private function computeLevel(int $totalXp): int
    {
        $level = 1;
        $required = self::LEVEL_XP_BASE;

        while ($totalXp >= $required) {
            $totalXp -= $required;
            $level++;
            $required = (int) ceil(self::LEVEL_XP_BASE * (self::LEVEL_XP_MULTIPLIER ** ($level - 1)));
        }

        return max(1, $level);
    }
}
