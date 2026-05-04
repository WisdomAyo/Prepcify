<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\UserStreak;
use Carbon\Carbon;
use Carbon\CarbonImmutable;

class StreakService
{
    private const FREEZE_MILESTONE = 10;

    public function recordActivity(User $user, Carbon $localDate): UserStreak
    {
        // Extract the calendar date string from the user's local timezone (timezone-agnostic comparison)
        $todayStr = CarbonImmutable::instance($localDate)->startOfDay()->toDateString();
        $todayCarbon = Carbon::parse($todayStr);

        $streak = UserStreak::firstOrNew(['user_id' => $user->id]);

        if (! $streak->exists) {
            $streak->fill([
                'user_id' => $user->id,
                'current_streak' => 1,
                'longest_streak' => 1,
                'last_active_date' => $todayCarbon,
                'freezes_available' => 0,
            ]);
            $streak->save();

            return $streak;
        }

        $lastActiveStr = $streak->last_active_date?->toDateString();

        if ($lastActiveStr === null) {
            $streak->current_streak = 1;
            $streak->last_active_date = $todayCarbon;
            $streak->longest_streak = max(1, (int) $streak->longest_streak);
            $streak->updated_at = now();
            $streak->save();

            return $streak;
        }

        // Compare calendar date strings to avoid timezone artifacts
        $daysDiff = (int) CarbonImmutable::parse($lastActiveStr)
            ->diffInDays(CarbonImmutable::parse($todayStr));

        if ($daysDiff === 0) {
            return $streak;
        }

        if ($daysDiff === 1) {
            $newStreak = (int) $streak->current_streak + 1;
            $streak->current_streak = $newStreak;
            $streak->longest_streak = max((int) $streak->longest_streak, $newStreak);
            $streak->last_active_date = $todayCarbon;

            if ($newStreak % self::FREEZE_MILESTONE === 0) {
                $streak->freezes_available = (int) $streak->freezes_available + 1;
            }
        } elseif ($daysDiff === 2 && $streak->freezes_available > 0) {
            $streak->freezes_available = (int) $streak->freezes_available - 1;
            $newStreak = (int) $streak->current_streak + 1;
            $streak->current_streak = $newStreak;
            $streak->longest_streak = max((int) $streak->longest_streak, $newStreak);
            $streak->last_active_date = $todayCarbon;
        } else {
            $streak->current_streak = 1;
            $streak->last_active_date = $todayCarbon;
        }

        $streak->updated_at = now();
        $streak->save();

        return $streak;
    }

    public function getStreak(User $user): UserStreak
    {
        return UserStreak::firstOrNew(
            ['user_id' => $user->id],
            [
                'current_streak' => 0,
                'longest_streak' => 0,
                'freezes_available' => 0,
            ],
        );
    }
}
