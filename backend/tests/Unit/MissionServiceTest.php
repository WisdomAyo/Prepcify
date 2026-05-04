<?php

declare(strict_types=1);

use App\Models\Mission;
use App\Models\User;
use App\Models\UserMission;
use App\Models\UserXp;
use App\Services\MissionService;
use App\Services\XpService;
use App\Support\Enums\MissionRecurrence;
use App\Support\Enums\UserType;
use Carbon\Carbon;

it('assignDailyMissions creates user missions for active daily missions', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    Mission::create([
        'code' => 'daily_5_questions',
        'name' => 'Answer 5 questions',
        'description' => 'Answer 5 questions today',
        'recurrence' => MissionRecurrence::Daily->value,
        'target' => 5,
        'reward_xp' => 50,
        'exam_body_id' => null,
    ]);

    app(MissionService::class)->assignDailyMissions($user);

    $this->assertDatabaseHas('user_missions', [
        'user_id' => $user->id,
        'period_key' => Carbon::now()->toDateString(),
        'progress' => 0,
    ]);
});

it('assignDailyMissions is idempotent when called twice', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    Mission::create([
        'code' => 'daily_once',
        'name' => 'Once a day',
        'description' => 'Once',
        'recurrence' => MissionRecurrence::Daily->value,
        'target' => 3,
        'reward_xp' => 20,
        'exam_body_id' => null,
    ]);

    $service = app(MissionService::class);
    $service->assignDailyMissions($user);
    $service->assignDailyMissions($user);

    expect(UserMission::where('user_id', $user->id)->count())->toBe(1);
});

it('recordProgress increments user mission progress', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $mission = Mission::create([
        'code' => 'progress_test',
        'name' => 'Progress test',
        'description' => 'Test',
        'recurrence' => MissionRecurrence::Daily->value,
        'target' => 10,
        'reward_xp' => 30,
        'exam_body_id' => null,
    ]);

    UserMission::create([
        'user_id' => $user->id,
        'mission_id' => $mission->id,
        'period_key' => Carbon::now()->toDateString(),
        'progress' => 0,
        'target' => 10,
        'completed_at' => null,
    ]);

    app(MissionService::class)->recordProgress($user, 'progress_test', 3);

    $this->assertDatabaseHas('user_missions', [
        'user_id' => $user->id,
        'mission_id' => $mission->id,
        'progress' => 3,
    ]);
});

it('recordProgress marks completed when target is reached', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $mission = Mission::create([
        'code' => 'complete_test',
        'name' => 'Complete test',
        'description' => 'Test',
        'recurrence' => MissionRecurrence::Daily->value,
        'target' => 5,
        'reward_xp' => 50,
        'exam_body_id' => null,
    ]);

    UserMission::create([
        'user_id' => $user->id,
        'mission_id' => $mission->id,
        'period_key' => Carbon::now()->toDateString(),
        'progress' => 4,
        'target' => 5,
        'completed_at' => null,
    ]);

    app(MissionService::class)->recordProgress($user, 'complete_test', 2);

    $record = UserMission::where('user_id', $user->id)->where('mission_id', $mission->id)->first();
    expect($record->progress)->toBe(5);
    expect($record->completed_at)->not->toBeNull();
});

it('recordProgress is a no-op for unknown mission code', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    expect(fn () => app(MissionService::class)->recordProgress($user, 'nonexistent_mission'))->not->toThrow(Throwable::class);
});

it('claimReward awards XP to the user', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $xpService = Mockery::mock(XpService::class);
    $xpService->shouldReceive('award')->once()->with($user, 100, 'mission:reward_claim')->andReturn(
        new UserXp(['user_id' => $user->id, 'total_xp' => 100, 'level' => 1]),
    );
    app()->instance(XpService::class, $xpService);

    $mission = Mission::create([
        'code' => 'reward_claim',
        'name' => 'Reward test',
        'description' => 'Test',
        'recurrence' => MissionRecurrence::Daily->value,
        'target' => 1,
        'reward_xp' => 100,
        'exam_body_id' => null,
    ]);

    $userMission = UserMission::create([
        'user_id' => $user->id,
        'mission_id' => $mission->id,
        'period_key' => Carbon::now()->toDateString(),
        'progress' => 1,
        'target' => 1,
        'completed_at' => now(),
    ]);

    $result = app(MissionService::class)->claimReward($user, $userMission->id);

    expect($result->id)->toBe($userMission->id);
});
