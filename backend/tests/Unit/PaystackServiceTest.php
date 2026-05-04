<?php

declare(strict_types=1);

use App\Services\PaystackService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.paystack.secret_key' => 'sk_test_secret']);
});

it('initializeTransaction posts to paystack and returns response', function () {
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'data' => ['authorization_url' => 'https://checkout.paystack.com/abc', 'reference' => 'ref123'],
        ], 200),
    ]);

    $service = app(PaystackService::class);
    $result = $service->initializeTransaction(
        email: 'test@example.com',
        amountMinor: 50000,
        currency: 'NGN',
        reference: 'lumio_ref123',
        metadata: ['plan_id' => 1],
    );

    expect($result['data']['authorization_url'])->toContain('paystack');
    Http::assertSent(fn ($req) => str_contains($req->url(), 'transaction/initialize'));
});

it('verifyTransaction calls paystack verify endpoint', function () {
    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response([
            'status' => true,
            'data' => ['status' => 'success', 'reference' => 'ref123'],
        ], 200),
    ]);

    $service = app(PaystackService::class);
    $result = $service->verifyTransaction('ref123');

    expect($result['data']['status'])->toBe('success');
    Http::assertSent(fn ($req) => str_contains($req->url(), 'verify/ref123'));
});

it('verifyWebhookSignature returns true for valid signature', function () {
    $service = app(PaystackService::class);
    $payload = '{"event":"charge.success"}';
    $signature = hash_hmac('sha512', $payload, 'sk_test_secret');

    expect($service->verifyWebhookSignature($payload, $signature))->toBeTrue();
});

it('verifyWebhookSignature returns false for tampered payload', function () {
    $service = app(PaystackService::class);
    $payload = '{"event":"charge.success"}';
    $signature = hash_hmac('sha512', $payload, 'sk_test_secret');

    expect($service->verifyWebhookSignature('tampered_payload', $signature))->toBeFalse();
});

it('processWebhookEvent logs the event without throwing', function () {
    $service = app(PaystackService::class);

    expect(fn () => $service->processWebhookEvent(['event' => 'charge.success']))->not->toThrow(Throwable::class);
});
