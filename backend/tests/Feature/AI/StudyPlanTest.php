<?php

declare(strict_types=1);

use App\Models\StudyPlan;
use App\Models\User;
use App\Services\ClaudeService;
use App\Services\StudyPlanService;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\UserType;

// CRITICAL TEST: feature flag kill switch
it('returns 503 when ai_study_plan_enabled is false on current', function () {
    config(['features.ai_study_plan_enabled' => false]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/me/study-plan');

    $response->assertStatus(503);
});

it('returns 503 when ai_study_plan_enabled is false on regenerate', function () {
    config(['features.ai_study_plan_enabled' => false]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $response = $this->actingAs($user)
        ->postJson('/api/v1/me/study-plan/regenerate');

    $response->assertStatus(503);
});

// CRITICAL TEST: returns null when no active plan exists
it('returns null when no study plan exists', function () {
    config(['features.ai_study_plan_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/me/study-plan');

    $response->assertOk()->assertJsonPath('data', null);
});

// CRITICAL TEST: returns null for expired plan
it('returns null when existing plan is expired', function () {
    config(['features.ai_study_plan_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    StudyPlan::create([
        'user_id' => $user->id,
        'content' => ['raw' => 'old plan'],
        'generated_at' => now()->subDays(10),
        'expires_at' => now()->subDays(3),
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/me/study-plan');

    $response->assertOk()->assertJsonPath('data', null);
});

// CRITICAL TEST: returns current non-expired plan
it('returns active study plan', function () {
    config(['features.ai_study_plan_enabled' => true]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    StudyPlan::create([
        'user_id' => $user->id,
        'content' => ['weeks' => []],
        'generated_at' => now(),
        'expires_at' => now()->addDays(7),
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/me/study-plan');

    $response->assertOk();
    expect($response->json('data'))->not->toBeNull();
    expect($response->json('data.content'))->toHaveKey('weeks');
});

// CRITICAL TEST: regenerate deletes old plan and creates new one
it('force regenerate replaces old plan', function () {
    config([
        'features.ai_study_plan_enabled' => true,
        'ai.routes.study_plan' => ['claude'],
        'ai.providers.claude' => [
            'class' => ClaudeService::class,
            'daily_budget_usd' => 100,
            'enabled' => true,
        ],
    ]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    StudyPlan::create([
        'user_id' => $user->id,
        'content' => ['raw' => 'old plan'],
        'generated_at' => now()->subDays(5),
        'expires_at' => now()->addDays(2),
    ]);

    $claude = Mockery::mock(ClaudeService::class)->makePartial();
    $claude->allows('isHealthy')->andReturn(true);
    $claude->allows('complete')->once()->andReturn(
        new AIResponse(
            content: '{"weeks": [{"day": 1}]}',
            model: 'claude-sonnet-4-6',
            inputTokens: 100,
            outputTokens: 50,
            cost: 0.001,
            provider: 'claude',
            durationMs: 200,
        ),
    );
    $this->app->instance(ClaudeService::class, $claude);

    $service = app(StudyPlanService::class);
    $newPlan = $service->forceRegenerate($user);

    expect($newPlan->content)->toHaveKey('weeks');
    expect(StudyPlan::where('user_id', $user->id)->count())->toBe(1);
});

// CRITICAL TEST: regenerate endpoint returns 201
it('regenerate endpoint returns 201 with new plan', function () {
    config([
        'features.ai_study_plan_enabled' => true,
        'ai.routes.study_plan' => ['claude'],
        'ai.providers.claude' => [
            'class' => ClaudeService::class,
            'daily_budget_usd' => 100,
            'enabled' => true,
        ],
    ]);

    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $claude = Mockery::mock(ClaudeService::class)->makePartial();
    $claude->allows('isHealthy')->andReturn(true);
    $claude->allows('complete')->once()->andReturn(
        new AIResponse(
            content: '{"weeks": [], "daily_sessions": []}',
            model: 'claude-sonnet-4-6',
            inputTokens: 100,
            outputTokens: 50,
            cost: 0.001,
            provider: 'claude',
            durationMs: 200,
        ),
    );
    $this->app->instance(ClaudeService::class, $claude);

    $response = $this->actingAs($user)
        ->postJson('/api/v1/me/study-plan/regenerate');

    $response->assertCreated();
    expect($response->json('data.id'))->not->toBeNull();
});

// CRITICAL TEST: unauthenticated rejected
it('returns 401 when unauthenticated', function () {
    $response = $this->getJson('/api/v1/me/study-plan');
    $response->assertUnauthorized();
});
