<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\UserXp;
use App\Services\XpService;
use App\Support\Enums\UserType;

it('award creates a new xp record for a new user', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $xp = app(XpService::class)->award($user, 100, 'first_attempt');

    expect($xp->user_id)->toBe($user->id);
    expect($xp->total_xp)->toBe(100);
    expect($xp->xp_this_week)->toBe(100);
    expect($xp->level)->toBeGreaterThanOrEqual(1);

    $this->assertDatabaseHas('user_xp', ['user_id' => $user->id, 'total_xp' => 100]);
});

it('award accumulates xp on subsequent calls', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(XpService::class);

    $service->award($user, 50, 'first');
    $xp = $service->award($user, 30, 'second');

    expect($xp->total_xp)->toBe(80);
    expect($xp->xp_this_week)->toBe(80);
});

it('award levels up when xp crosses threshold', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(XpService::class);

    // Level 1 requires 100 XP to advance
    $xp = $service->award($user, 150, 'big_award');

    expect($xp->level)->toBeGreaterThanOrEqual(2);
});

it('award resets weekly xp when a new week begins', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    // Manually create a stale weekly record
    UserXp::create([
        'user_id' => $user->id,
        'total_xp' => 200,
        'level' => 2,
        'xp_this_week' => 75,
        'week_starts_at' => now()->subWeek()->startOfWeek()->toDateString(),
        'updated_at' => now(),
    ]);

    $xp = app(XpService::class)->award($user, 10, 'post_reset');

    // weekly xp resets to 0 then adds 10
    expect($xp->xp_this_week)->toBe(10);
    // total should still accumulate
    expect($xp->total_xp)->toBe(210);
});

it('award does not go below zero for negative amounts', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $service = app(XpService::class);

    $service->award($user, 20, 'give');
    $xp = $service->award($user, -100, 'penalty');

    expect($xp->total_xp)->toBe(0);
    expect($xp->xp_this_week)->toBe(0);
});

it('getXp returns existing record', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    app(XpService::class)->award($user, 50, 'seed');

    $xp = app(XpService::class)->getXp($user);

    expect($xp->total_xp)->toBe(50);
    expect($xp->exists)->toBeTrue();
});

it('getXp returns an unsaved default record for a user with no xp', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $xp = app(XpService::class)->getXp($user);

    expect($xp->total_xp)->toBe(0);
    expect($xp->level)->toBe(1);
});
