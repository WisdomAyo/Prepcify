<?php

declare(strict_types=1);

use App\Models\Payment;
use App\Models\Plan;
use App\Models\PlanPrice;
use App\Models\Subscription;
use App\Models\User;
use App\Services\EntitlementService;
use App\Services\PaystackService;
use App\Services\SubscriptionService;
use App\Support\Enums\PaymentStatus;
use App\Support\Enums\SubscriptionStatus;
use App\Support\Enums\UserType;

function makeSubscriptionService(): SubscriptionService
{
    $paystack = Mockery::mock(PaystackService::class);
    $paystack->allows('initializeTransaction')->andReturn([
        'data' => ['authorization_url' => 'https://checkout.paystack.com/test'],
    ]);

    $entitlement = Mockery::mock(EntitlementService::class);
    $entitlement->allows('invalidate')->andReturn(null);

    app()->instance(PaystackService::class, $paystack);
    app()->instance(EntitlementService::class, $entitlement);

    return app(SubscriptionService::class);
}

it('startCheckout creates a pending payment and returns authorization_url', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value, 'email' => 'payer@test.com']);

    $plan = Plan::factory()->create(['code' => 'pro', 'active' => true]);
    PlanPrice::create([
        'plan_id' => $plan->id,
        'currency' => 'NGN',
        'interval' => 'monthly',
        'amount_minor' => 500000,
    ]);

    $service = makeSubscriptionService();
    $result = $service->startCheckout($user, 'pro', 'NGN', 'monthly');

    expect($result['authorization_url'])->toContain('paystack');
    $this->assertDatabaseHas('payments', ['user_id' => $user->id, 'status' => PaymentStatus::Pending->value]);
});

it('handlePaymentSuccess creates subscription and marks payment as paid', function () {
    $payer = User::factory()->create(['user_type' => UserType::Student->value]);
    $plan = Plan::factory()->create(['code' => 'basic', 'active' => true]);

    $payment = Payment::create([
        'user_id' => $payer->id,
        'subscription_id' => null,
        'amount_minor' => 100000,
        'currency' => 'NGN',
        'status' => PaymentStatus::Pending->value,
        'paystack_reference' => 'lumio_test_ref',
        'paid_at' => null,
        'metadata' => [
            'payer_id' => $payer->id,
            'beneficiary_id' => $payer->id,
            'plan_id' => $plan->id,
            'interval' => 'monthly',
        ],
    ]);

    $service = makeSubscriptionService();
    $service->handlePaymentSuccess('lumio_test_ref', []);

    $this->assertDatabaseHas('payments', ['id' => $payment->id, 'status' => PaymentStatus::Success->value]);
    $this->assertDatabaseHas('subscriptions', ['user_id' => $payer->id, 'status' => SubscriptionStatus::Active->value]);
});

it('handlePaymentSuccess is idempotent for already-paid reference', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $plan = Plan::factory()->create();

    Payment::create([
        'user_id' => $user->id,
        'subscription_id' => null,
        'amount_minor' => 100000,
        'currency' => 'NGN',
        'status' => PaymentStatus::Success->value,
        'paystack_reference' => 'lumio_already_paid',
        'paid_at' => now(),
        'metadata' => ['plan_id' => $plan->id, 'beneficiary_id' => $user->id, 'payer_id' => $user->id, 'interval' => 'monthly'],
    ]);

    $service = makeSubscriptionService();
    $service->handlePaymentSuccess('lumio_already_paid', []);

    expect(Subscription::where('user_id', $user->id)->count())->toBe(0);
});

it('cancel marks subscription as cancelled', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    $subscription = Subscription::factory()->active()->create(['user_id' => $user->id]);

    $service = makeSubscriptionService();
    $result = $service->cancel($user, $subscription->id);

    expect($result->status)->toBe(SubscriptionStatus::Cancelled);
    expect($result->cancelled_at)->not->toBeNull();
});

it('currentSubscription returns active subscription within period', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);
    Subscription::factory()->active()->create(['user_id' => $user->id]);

    $service = makeSubscriptionService();
    $result = $service->currentSubscription($user);

    expect($result)->not->toBeNull();
    expect($result->status)->toBe(SubscriptionStatus::Active);
});

it('currentSubscription returns null when no active subscription', function () {
    $user = User::factory()->create(['user_type' => UserType::Student->value]);

    $service = makeSubscriptionService();
    $result = $service->currentSubscription($user);

    expect($result)->toBeNull();
});
