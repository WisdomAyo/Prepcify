<?php

declare(strict_types=1);

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\EntitlementService;
use App\Services\UserContextResolver;
use App\Support\Enums\SubscriptionStatus;
use Illuminate\Support\Facades\Cache;

// CRITICAL TEST: free-tier user's entitlement limit enforced in UserContext
it('free tier user gets default entitlements in UserContext (3 AI messages/day)', function () {
    $user = User::factory()->create();

    // No subscription — should default to free tier entitlements
    $context = app(UserContextResolver::class)->resolve($user->id);

    expect($context->entitlements)->toHaveKey('ai_tutor_messages_per_day')
        ->and($context->entitlements['ai_tutor_messages_per_day'])->toBe(3)
        ->and($context->entitlements['plan_code'])->toBe('free');
});

it('subscribed user gets plan entitlements in UserContext', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->pro()->create();

    Subscription::factory()->for($user)->create([
        'plan_id' => $plan->id,
        'status' => SubscriptionStatus::Active->value,
        'current_period_end' => now()->addMonth(),
    ]);

    // Bust cache since we just created the subscription
    app(EntitlementService::class)->invalidate($user->id);
    app(UserContextResolver::class)->forget($user->id);

    $context = app(UserContextResolver::class)->resolve($user->id);

    expect($context->entitlements['ai_tutor_messages_per_day'])->toBe(50)
        ->and($context->entitlements['plan_code'])->toBe('pro');
});

it('returns free tier when subscription is expired', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->pro()->create();

    Subscription::factory()->for($user)->expired()->create([
        'plan_id' => $plan->id,
    ]);

    app(EntitlementService::class)->invalidate($user->id);

    $entitlements = app(EntitlementService::class)->forUser($user->id);

    expect($entitlements['ai_tutor_messages_per_day'])->toBe(3)
        ->and($entitlements['plan_code'])->toBe('free');
});

it('returns free tier when subscription is cancelled', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->pro()->create();

    Subscription::factory()->for($user)->cancelled()->create([
        'plan_id' => $plan->id,
    ]);

    app(EntitlementService::class)->invalidate($user->id);

    $entitlements = app(EntitlementService::class)->forUser($user->id);

    expect($entitlements['plan_code'])->toBe('free');
});

it('caches entitlements for the same user', function () {
    $user = User::factory()->create();

    app(EntitlementService::class)->invalidate($user->id);

    // First call — builds from DB
    $first = app(EntitlementService::class)->forUser($user->id);

    // Second call — from cache (create a plan after to verify it won't be picked up)
    $plan = Plan::factory()->pro()->create();
    Subscription::factory()->for($user)->active()->create(['plan_id' => $plan->id]);

    $second = app(EntitlementService::class)->forUser($user->id);

    expect($second)->toBe($first);
});

it('invalidate clears the cache so fresh data is returned', function () {
    $user = User::factory()->create();

    app(EntitlementService::class)->invalidate($user->id);

    $before = app(EntitlementService::class)->forUser($user->id);
    expect($before['plan_code'])->toBe('free');

    $plan = Plan::factory()->pro()->create();
    Subscription::factory()->for($user)->active()->create([
        'plan_id' => $plan->id,
        'current_period_end' => now()->addMonth(),
    ]);

    app(EntitlementService::class)->invalidate($user->id);
    $after = app(EntitlementService::class)->forUser($user->id);

    expect($after['plan_code'])->toBe('pro');
});

it('entitlements appear in the /me/context response', function () {
    $user = User::factory()->create();

    app(EntitlementService::class)->invalidate($user->id);
    app(UserContextResolver::class)->forget($user->id);

    $response = $this->actingAs($user)->getJson('/api/v1/me/context');

    $response->assertOk()
        ->assertJsonPath('data.entitlements.plan_code', 'free')
        ->assertJsonPath('data.entitlements.ai_tutor_messages_per_day', 3);
});
