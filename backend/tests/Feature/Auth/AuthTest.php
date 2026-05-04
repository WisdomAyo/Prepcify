<?php

declare(strict_types=1);

use App\Models\SmsOtp;
use App\Models\User;
use App\Support\Enums\UserType;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\PersonalAccessToken;

// ─── Register ────────────────────────────────────────────────────────────────

describe('register', function () {
    it('registers a new user and returns token', function () {
        Event::fake();

        $this->postJson('/api/v1/auth/register', [
            'email' => 'student@lumio.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'display_name' => 'Test Student',
        ])->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'email', 'user_type'], 'token']);

        expect(User::where('email', 'student@lumio.test')->exists())->toBeTrue();
        Event::assertDispatched(Registered::class);
    });

    it('defaults user_type to student', function () {
        $this->postJson('/api/v1/auth/register', [
            'email' => 'student@lumio.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertCreated();

        expect(User::where('email', 'student@lumio.test')->first()->user_type)->toBe(UserType::Student);
    });

    it('rejects duplicate email', function () {
        User::factory()->create(['email' => 'taken@lumio.test']);

        $this->postJson('/api/v1/auth/register', [
            'email' => 'taken@lumio.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);
    });

    it('rejects mismatched passwords', function () {
        $this->postJson('/api/v1/auth/register', [
            'email' => 'new@lumio.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Different!',
        ])->assertUnprocessable()->assertJsonValidationErrors(['password']);
    });

    it('rejects missing required fields', function () {
        $this->postJson('/api/v1/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('login', function () {
    it('logs in with email and returns token', function () {
        User::factory()->create([
            'email' => 'login@lumio.test',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'login@lumio.test',
            'password' => 'Password123!',
        ])->assertOk()->assertJsonStructure(['data' => ['id', 'email'], 'token']);
    });

    it('logs in with phone number', function () {
        User::factory()->create([
            'email' => null,
            'phone' => '+2348012345678',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'phone' => '+2348012345678',
            'password' => 'Password123!',
        ])->assertOk()->assertJsonStructure(['data' => ['id'], 'token']);
    });

    it('rejects wrong password', function () {
        User::factory()->create([
            'email' => 'login@lumio.test',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'login@lumio.test',
            'password' => 'WrongPassword!',
        ])->assertUnprocessable();
    });

    it('rejects missing fields', function () {
        $this->postJson('/api/v1/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['identifier', 'password']);
    });

    it('updates last_login_at on successful login', function () {
        $user = User::factory()->create([
            'email' => 'login@lumio.test',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'login@lumio.test',
            'password' => 'Password123!',
        ])->assertOk();

        expect($user->fresh()->last_login_at)->not->toBeNull();
    });
});

// ─── Logout ──────────────────────────────────────────────────────────────────

describe('logout', function () {
    it('invalidates the token on logout', function () {
        $user = User::factory()->create(['password' => Hash::make('pass')]);
        $result = $user->createToken('test');
        $token = $result->plainTextToken;
        $tokenId = $result->accessToken->id;

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk();

        // Verify the token row was removed from the DB (direct assertion — the auth guard
        // caches the user across HTTP calls in the same test process, making a second
        // request an unreliable signal for token invalidation).
        expect(PersonalAccessToken::find($tokenId))->toBeNull();
    });

    it('requires authentication', function () {
        $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
    });
});

// ─── Password Reset ──────────────────────────────────────────────────────────

describe('password reset', function () {
    it('sends reset link without revealing if email exists', function () {
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'nonexistent@lumio.test',
        ])->assertOk()->assertJsonFragment(['message' => 'If that email exists, a reset link has been sent.']);
    });

    it('requires email field', function () {
        $this->postJson('/api/v1/auth/password/forgot', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    });

    it('resets password with valid token', function () {
        $user = User::factory()->create(['email' => 'reset@lumio.test']);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => 'reset@lumio.test',
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertOk();

        expect(Hash::check('NewPassword123!', $user->fresh()->password))->toBeTrue();
    });

    it('rejects invalid token', function () {
        User::factory()->create(['email' => 'reset@lumio.test']);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => 'reset@lumio.test',
            'token' => 'invalid-token',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertUnprocessable();
    });
});

// ─── Me ──────────────────────────────────────────────────────────────────────

describe('me endpoint', function () {
    it('returns authenticated user data', function () {
        $user = User::factory()->create(['email' => 'me@lumio.test']);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'me@lumio.test');
    });

    it('returns 401 when unauthenticated', function () {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    });
});

// ─── OTP ─────────────────────────────────────────────────────────────────────

describe('phone OTP', function () {
    it('sends OTP and can verify it', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/phone/otp/send', ['phone' => '+2348099999999'])
            ->assertOk();

        $otp = SmsOtp::where('user_id', $user->id)->latest('created_at')->first();
        expect($otp)->not->toBeNull();

        $this->withToken($token)
            ->postJson('/api/v1/auth/phone/otp/verify', [
                'phone' => '+2348099999999',
                'code' => $otp->code,
            ])->assertOk();

        expect($user->fresh()->phone_verified_at)->not->toBeNull();
    });

    it('rejects invalid OTP code', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/phone/otp/send', ['phone' => '+2348099999999'])
            ->assertOk();

        $this->withToken($token)
            ->postJson('/api/v1/auth/phone/otp/verify', [
                'phone' => '+2348099999999',
                'code' => '000000',
            ])->assertUnprocessable();
    });

    it('requires auth for OTP endpoints', function () {
        $this->postJson('/api/v1/auth/phone/otp/send', ['phone' => '+2348099999999'])
            ->assertUnauthorized();
    });
});
