<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\UserStreak;
use App\Services\StreakService;
use App\Support\Enums\UserType;
use Carbon\Carbon;

it('creates a new streak on first activity', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $streak = app(StreakService::class)->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(1);
    expect($streak->longest_streak)->toBe(1);
    $this->assertDatabaseHas('user_streaks', ['user_id' => $user->id, 'current_streak' => 1]);
});

it('increments streak on consecutive days', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(StreakService::class);

    $service->recordActivity($user, Carbon::yesterday());
    $streak = $service->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(2);
    expect($streak->longest_streak)->toBe(2);
});

it('returns same streak when called twice on the same day', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(StreakService::class);

    $service->recordActivity($user, Carbon::today());
    $streak = $service->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(1);
});

it('resets streak to 1 after missing more than one day without freeze', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(StreakService::class);

    $service->recordActivity($user, Carbon::now()->subDays(3));
    $streak = $service->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(1);
});

it('uses a freeze when exactly one day is missed', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    UserStreak::create([
        'user_id' => $user->id,
        'current_streak' => 5,
        'longest_streak' => 5,
        'last_active_date' => Carbon::now()->subDays(2)->toDateString(),
        'freezes_available' => 1,
    ]);

    $streak = app(StreakService::class)->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(6);
    expect($streak->freezes_available)->toBe(0);
});

it('resets streak when one day is missed without a freeze', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    UserStreak::create([
        'user_id' => $user->id,
        'current_streak' => 5,
        'longest_streak' => 5,
        'last_active_date' => Carbon::now()->subDays(2)->toDateString(),
        'freezes_available' => 0,
    ]);

    $streak = app(StreakService::class)->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(1);
});

it('awards a freeze at streak milestone of 10', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    UserStreak::create([
        'user_id' => $user->id,
        'current_streak' => 9,
        'longest_streak' => 9,
        'last_active_date' => Carbon::yesterday()->toDateString(),
        'freezes_available' => 0,
    ]);

    $streak = app(StreakService::class)->recordActivity($user, Carbon::today());

    expect($streak->current_streak)->toBe(10);
    expect($streak->freezes_available)->toBe(1);
});

it('getStreak returns default for user with no streak record', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $streak = app(StreakService::class)->getStreak($user);

    expect($streak->current_streak)->toBe(0);
    expect($streak->exists)->toBeFalse();
});

it('getStreak returns existing record', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    app(StreakService::class)->recordActivity($user, Carbon::today());

    $streak = app(StreakService::class)->getStreak($user);

    expect($streak->current_streak)->toBe(1);
    expect($streak->exists)->toBeTrue();
});
