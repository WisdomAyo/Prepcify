<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\UserStreak;
use App\Services\StreakService;
use Carbon\Carbon;

beforeEach(function () {
    $this->service = app(StreakService::class);
});

it('starts a streak of 1 on first activity', function () {
    $user = User::factory()->create();
    $today = Carbon::parse('2026-01-10', 'Africa/Lagos');

    $streak = $this->service->recordActivity($user, $today);

    expect($streak->current_streak)->toBe(1)
        ->and($streak->longest_streak)->toBe(1)
        ->and($streak->last_active_date->toDateString())->toBe('2026-01-10');
});

it('extends streak on consecutive days', function () {
    $user = User::factory()->create();

    $this->service->recordActivity($user, Carbon::parse('2026-01-10', 'Africa/Lagos'));
    $streak = $this->service->recordActivity($user, Carbon::parse('2026-01-11', 'Africa/Lagos'));

    expect($streak->current_streak)->toBe(2)
        ->and($streak->longest_streak)->toBe(2);
});

it('does not double-count same-day activity', function () {
    $user = User::factory()->create();

    $this->service->recordActivity($user, Carbon::parse('2026-01-10 09:00', 'Africa/Lagos'));
    $streak = $this->service->recordActivity($user, Carbon::parse('2026-01-10 21:00', 'Africa/Lagos'));

    expect($streak->current_streak)->toBe(1);
});

it('resets streak when a day is skipped without freeze', function () {
    $user = User::factory()->create();

    $this->service->recordActivity($user, Carbon::parse('2026-01-10', 'Africa/Lagos'));
    $streak = $this->service->recordActivity($user, Carbon::parse('2026-01-12', 'Africa/Lagos'));

    expect($streak->current_streak)->toBe(1)
        ->and($streak->longest_streak)->toBe(1);
});

// CRITICAL TEST: timezone edge case
// User timezone is Asia/Shanghai (UTC+8). Server runs UTC.
// Activity at 2026-01-11 00:30 Asia/Shanghai = 2026-01-10 16:30 UTC.
// Two activities in same local day should count as one; crossing midnight
// in local timezone should extend streak even though server-side UTC date hasn't changed.
it('respects user local timezone for streak transitions (Asia/Shanghai UTC+8)', function () {
    $user = User::factory()->create(['timezone' => 'Asia/Shanghai']);

    // Day 1: Jan 10 local time
    $day1 = Carbon::parse('2026-01-10 20:00:00', 'Asia/Shanghai');
    $this->service->recordActivity($user, $day1);

    // Day 2: Jan 11 local time — but UTC equivalent is still Jan 10 (00:00 UTC+8 = Jan 10 16:00 UTC)
    // 2026-01-11 00:30 Asia/Shanghai → 2026-01-10 16:30 UTC
    $day2 = Carbon::parse('2026-01-11 00:30:00', 'Asia/Shanghai');
    $streak = $this->service->recordActivity($user, $day2);

    // Should be 2, because from the user's perspective it IS the next day
    expect($streak->current_streak)->toBe(2)
        ->and($streak->last_active_date->toDateString())->toBe('2026-01-11');
});

it('awards a freeze every 10 consecutive days', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        $this->service->recordActivity($user, Carbon::parse('2026-01-01')->addDays($i));
    }

    $streak = UserStreak::where('user_id', $user->id)->first();
    expect($streak->current_streak)->toBe(10)
        ->and($streak->freezes_available)->toBe(1);
});

it('consumes a freeze to bridge a skipped day', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        $this->service->recordActivity($user, Carbon::parse('2026-01-01')->addDays($i));
    }

    // Skip Jan 11, come back Jan 12 (2-day gap → freeze consumed)
    $streak = $this->service->recordActivity($user, Carbon::parse('2026-01-12'));

    expect($streak->current_streak)->toBe(11)
        ->and($streak->freezes_available)->toBe(0);
});

it('resets if skipped by 2+ days and no freeze available', function () {
    $user = User::factory()->create();
    $this->service->recordActivity($user, Carbon::parse('2026-01-01'));
    $this->service->recordActivity($user, Carbon::parse('2026-01-02'));

    $streak = $this->service->recordActivity($user, Carbon::parse('2026-01-05'));

    expect($streak->current_streak)->toBe(1);
});

it('updates longest_streak correctly', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->service->recordActivity($user, Carbon::parse('2026-01-01')->addDays($i));
    }

    // gap — reset
    $this->service->recordActivity($user, Carbon::parse('2026-01-10'));
    $this->service->recordActivity($user, Carbon::parse('2026-01-11'));

    $streak = UserStreak::where('user_id', $user->id)->first();
    expect($streak->current_streak)->toBe(2)
        ->and($streak->longest_streak)->toBe(5);
});
