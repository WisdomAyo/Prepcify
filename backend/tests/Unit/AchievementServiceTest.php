<?php

declare(strict_types=1);

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserXp;
use App\Services\AchievementService;
use App\Services\XpService;
use App\Support\Enums\UserType;

it('checkAndAward grants achievement when criteria threshold is met', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $achievement = Achievement::factory()->create([
        'code' => 'streak_7',
        'criteria' => ['trigger' => 'streak', 'threshold' => 7, 'reward_xp' => 50],
    ]);

    app(AchievementService::class)->checkAndAward($user, 'streak', ['value' => 7]);

    $this->assertDatabaseHas('user_achievements', [
        'user_id' => $user->id,
        'achievement_id' => $achievement->id,
    ]);
});

it('checkAndAward does not re-award an achievement already earned', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $achievement = Achievement::factory()->create([
        'criteria' => ['trigger' => 'streak', 'threshold' => 5, 'reward_xp' => 50],
    ]);

    UserAchievement::create([
        'user_id' => $user->id,
        'achievement_id' => $achievement->id,
        'earned_at' => now(),
    ]);

    app(AchievementService::class)->checkAndAward($user, 'streak', ['value' => 10]);

    expect(
        UserAchievement::where('user_id', $user->id)
            ->where('achievement_id', $achievement->id)
            ->count(),
    )->toBe(1);
});

it('checkAndAward does not award when threshold not met', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    Achievement::factory()->create([
        'criteria' => ['trigger' => 'streak', 'threshold' => 10, 'reward_xp' => 50],
    ]);

    app(AchievementService::class)->checkAndAward($user, 'streak', ['value' => 3]);

    expect(UserAchievement::where('user_id', $user->id)->count())->toBe(0);
});

it('checkAndAward awards xp via XpService when achievement is granted', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $achievement = Achievement::factory()->create([
        'code' => 'xp_test',
        'criteria' => ['trigger' => 'streak', 'threshold' => 1, 'reward_xp' => 75],
    ]);

    $xpService = Mockery::mock(XpService::class);
    $xpService->allows('award')
        ->once()
        ->with($user, 75, 'achievement:'.$achievement->code)
        ->andReturn(new UserXp);
    $this->app->instance(XpService::class, $xpService);

    app(AchievementService::class)->checkAndAward($user, 'streak', ['value' => 5]);
});

it('checkAndAward awards when no threshold in criteria', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $achievement = Achievement::factory()->create([
        'criteria' => ['trigger' => 'login', 'reward_xp' => 10],
    ]);

    app(AchievementService::class)->checkAndAward($user, 'login', []);

    $this->assertDatabaseHas('user_achievements', ['user_id' => $user->id, 'achievement_id' => $achievement->id]);
});
