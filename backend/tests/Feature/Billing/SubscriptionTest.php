<?php

declare(strict_types=1);

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use App\Support\Enums\UserType;

it('GET /me/subscription returns null when user has no subscription', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $this->mock(SubscriptionService::class, function ($mock) {
        $mock->shouldReceive('currentSubscription')->once()->andReturn(null);
    });

    $response = $this->actingAs($user)->getJson('/api/v1/me/subscription');

    $response->assertOk()->assertJson(['subscription' => null]);
});

it('GET /me/subscription returns subscription data when active', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $subscription = Subscription::factory()->active()->create(['user_id' => $user->id]);

    $this->mock(SubscriptionService::class, function ($mock) use ($subscription) {
        $mock->shouldReceive('currentSubscription')->once()->andReturn($subscription);
    });

    $response = $this->actingAs($user)->getJson('/api/v1/me/subscription');

    $response->assertOk();
    expect($response->json('subscription.id'))->toBe($subscription->id);
});

it('GET /me/subscription returns 401 when unauthenticated', function () {
    $this->getJson('/api/v1/me/subscription')->assertUnauthorized();
});

it('POST /me/subscription/start returns 201 with authorization_url', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    // StartSubscriptionRequest validates plan_code exists in active plans
    Plan::factory()->create(['code' => 'pro', 'active' => true]);

    $this->mock(SubscriptionService::class, function ($mock) {
        $mock->shouldReceive('startCheckout')->once()->andReturn([
            'authorization_url' => 'https://checkout.paystack.com/test_abc',
            'reference' => 'lumio_testref123',
        ]);
    });

    $response = $this->actingAs($user)->postJson('/api/v1/me/subscription/start', [
        'plan_code' => 'pro',
        'currency' => 'NGN',
        'interval' => 'monthly',
    ]);

    $response->assertCreated();
    expect($response->json('authorization_url'))->toContain('paystack');
});

it('POST /me/subscription/start returns 401 when unauthenticated', function () {
    $this->postJson('/api/v1/me/subscription/start', [
        'plan_code' => 'pro',
        'currency' => 'NGN',
        'interval' => 'monthly',
    ])->assertUnauthorized();
});

it('POST /me/subscription/{id}/cancel returns cancelled subscription', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $subscription = Subscription::factory()->active()->create(['user_id' => $user->id]);

    $cancelled = $subscription->loadMissing('plan');

    $this->mock(SubscriptionService::class, function ($mock) use ($cancelled) {
        $mock->shouldReceive('cancel')->once()->andReturn($cancelled);
    });

    $response = $this->actingAs($user)
        ->postJson("/api/v1/me/subscription/{$subscription->id}/cancel");

    $response->assertSuccessful();
    expect($response->json('data.id'))->toBe($subscription->id);
});
