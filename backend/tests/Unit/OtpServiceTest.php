<?php

declare(strict_types=1);

use App\Models\User;
use App\Services\OtpService;

it('generates a 6-digit OTP code', function () {
    $service = new OtpService;
    $user = User::factory()->create();

    $otp = $service->generate($user, '+2348012345678');

    expect($otp->code)->toHaveLength(6);
    expect(ctype_digit($otp->code))->toBeTrue();
    expect($otp->expires_at->isFuture())->toBeTrue();
});

it('invalidates previous OTP when a new one is generated', function () {
    $service = new OtpService;
    $user = User::factory()->create();

    $first = $service->generate($user, '+2348012345678');
    $second = $service->generate($user, '+2348012345678');

    $first->refresh();
    expect($first->expires_at->isPast())->toBeTrue();
    expect($second->expires_at->isFuture())->toBeTrue();
});

it('verifies a valid OTP and marks it verified', function () {
    $service = new OtpService;
    $user = User::factory()->create();

    $otp = $service->generate($user, '+2348012345678');
    $result = $service->verify($user, '+2348012345678', $otp->code);

    expect($result)->toBeTrue();
    expect($otp->fresh()->verified_at)->not->toBeNull();
});

it('rejects an already-verified OTP', function () {
    $service = new OtpService;
    $user = User::factory()->create();

    $otp = $service->generate($user, '+2348012345678');
    $service->verify($user, '+2348012345678', $otp->code);

    // Second verification attempt must fail
    $result = $service->verify($user, '+2348012345678', $otp->code);
    expect($result)->toBeFalse();
});

it('rejects a wrong code', function () {
    $service = new OtpService;
    $user = User::factory()->create();

    $service->generate($user, '+2348012345678');

    $result = $service->verify($user, '+2348012345678', '000000');
    expect($result)->toBeFalse();
});

it('rejects an expired OTP', function () {
    $service = new OtpService;
    $user = User::factory()->create();

    $otp = $service->generate($user, '+2348012345678');

    // Force expiry
    $otp->update(['expires_at' => now()->subMinute()]);

    $result = $service->verify($user, '+2348012345678', $otp->code);
    expect($result)->toBeFalse();
});
