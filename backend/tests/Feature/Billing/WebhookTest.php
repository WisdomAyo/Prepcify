<?php

declare(strict_types=1);

use App\Jobs\PaystackWebhookJob;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use App\Services\SubscriptionService;
use App\Support\Enums\PaymentStatus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;

function paystackSignature(string $payload, string $secret = 'test_secret'): string
{
    return hash_hmac('sha512', $payload, $secret);
}

function configurePaystackSecret(string $secret = 'test_secret'): void
{
    config(['services.paystack.secret_key' => $secret]);
}

// CRITICAL TEST 1: invalid signature → 401
it('rejects webhook with invalid signature and returns 401', function () {
    configurePaystackSecret('real_secret');

    $payload = json_encode(['event' => 'charge.success', 'data' => []]);
    $badSignature = hash_hmac('sha512', (string) $payload, 'wrong_secret');

    $response = $this->postJson('/api/v1/webhooks/paystack', [], [
        'X-Paystack-Signature' => $badSignature,
        'Content-Type' => 'application/json',
    ]);

    $response->assertStatus(401);
});

// CRITICAL TEST 2: valid signature → 200 + job dispatched
it('accepts webhook with valid signature and dispatches job', function () {
    Queue::fake();
    configurePaystackSecret('test_secret');

    $event = [
        'id' => 'evt_abc123',
        'event' => 'charge.success',
        'data' => ['reference' => 'lumio_ref123'],
    ];
    $payload = json_encode($event);
    $signature = paystackSignature((string) $payload, 'test_secret');

    $response = $this->call('POST', '/api/v1/webhooks/paystack', [], [], [], [
        'HTTP_X-Paystack-Signature' => $signature,
        'CONTENT_TYPE' => 'application/json',
    ], (string) $payload);

    $response->assertOk()
        ->assertJsonPath('status', 'queued');

    Queue::assertPushed(PaystackWebhookJob::class, fn ($job) => $job->eventId === 'evt_abc123');
});

// CRITICAL TEST 3: duplicate event_id → idempotent no-op
it('does not process the same event_id twice (idempotent)', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->create();

    $payment = Payment::create([
        'user_id' => $user->id,
        'subscription_id' => null,
        'amount_minor' => 5000,
        'currency' => 'NGN',
        'status' => PaymentStatus::Pending->value,
        'paystack_reference' => 'lumio_idempotent',
        'paid_at' => null,
        'metadata' => [
            'payer_id' => $user->id,
            'beneficiary_id' => $user->id,
            'plan_id' => $plan->id,
            'interval' => 'monthly',
        ],
    ]);

    $eventId = 'evt_duplicate';
    $event = [
        'id' => $eventId,
        'event' => 'charge.success',
        'data' => ['reference' => 'lumio_idempotent'],
    ];

    $job = new PaystackWebhookJob($eventId, $event);

    // First run: processes
    $job->handle(app(SubscriptionService::class));

    $payment->refresh();
    expect($payment->status->value)->toBe(PaymentStatus::Success->value);

    // Reset to pending to test idempotency guard
    $payment->update(['status' => PaymentStatus::Pending->value]);

    // Second run: idempotency cache hit → no processing
    $job2 = new PaystackWebhookJob($eventId, $event);
    $job2->handle(app(SubscriptionService::class));

    $payment->refresh();
    expect($payment->status->value)->toBe(PaymentStatus::Pending->value);
});

it('handles unknown event types gracefully without throwing', function () {
    $eventId = 'evt_unknown_'.uniqid();
    $event = ['id' => $eventId, 'event' => 'unknown.event', 'data' => []];

    $job = new PaystackWebhookJob($eventId, $event);

    expect(fn () => $job->handle(app(SubscriptionService::class)))->not->toThrow(Throwable::class);
});

it('creates a subscription on successful charge', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->pro()->create();

    $payment = Payment::create([
        'user_id' => $user->id,
        'subscription_id' => null,
        'amount_minor' => 10000,
        'currency' => 'NGN',
        'status' => PaymentStatus::Pending->value,
        'paystack_reference' => 'lumio_sub_create',
        'paid_at' => null,
        'metadata' => [
            'payer_id' => $user->id,
            'beneficiary_id' => $user->id,
            'plan_id' => $plan->id,
            'interval' => 'monthly',
        ],
    ]);

    $eventId = 'evt_sub_'.uniqid();
    $event = [
        'id' => $eventId,
        'event' => 'charge.success',
        'data' => ['reference' => 'lumio_sub_create'],
    ];

    $job = new PaystackWebhookJob($eventId, $event);
    $job->handle(app(SubscriptionService::class));

    $this->assertDatabaseHas('payments', [
        'paystack_reference' => 'lumio_sub_create',
        'status' => PaymentStatus::Success->value,
    ]);

    $this->assertDatabaseHas('subscriptions', [
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => 'active',
    ]);
});
