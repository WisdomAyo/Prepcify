<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Support\Enums\UserType;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private readonly AuditLogService $auditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     * @return array{user: User, token: string}
     */
    public function register(array $validated): array
    {
        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'display_name' => $validated['display_name'] ?? null,
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'user_type' => $validated['user_type'] ?? UserType::Student->value,
        ]);

        event(new Registered($user));

        $token = $user->createToken('auth-token')->plainTextToken;

        $this->auditLog->log('auth.register', User::class, $user->id, after: ['email' => $user->email]);

        return ['user' => $user, 'token' => $token];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function login(array $validated): array
    {
        $identifier = $validated['identifier'];
        $password = $validated['password'];

        // Determine if identifier is email or phone
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $identifier)->first();

        if (! $user || ! Hash::check($password, (string) $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Update last login metadata
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        $this->auditLog->log('auth.login', User::class, $user->id);

        return ['user' => $user, 'token' => $token];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
        $this->auditLog->log('auth.logout', User::class, $user->id);
    }

    public function forgotPassword(string $email): void
    {
        Password::sendResetLink(['email' => $email]);
        // We don't expose whether the email exists — always succeed silently
    }

    /**
     * @param  array<string, mixed>  $validated
     *
     * @throws ValidationException
     */
    public function resetPassword(array $validated): void
    {
        $status = Password::reset(
            $validated,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $this->auditLog->log('auth.password_reset', User::class, $user->id);
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => [__($status)],
            ]);
        }
    }

    public function me(User $user): User
    {
        $user->load(['studentProfile', 'parentProfile']);

        return $user;
    }

    /**
     * Patch the authenticated user's profile fields.
     *
     * @param  array<string, mixed>  $validated
     */
    public function updateProfile(User $user, array $validated): User
    {
        $allowed = [
            'display_name',
            'first_name',
            'last_name',
            'phone',
            'country',
            'state',
            'city',
            'avatar_url',
            'timezone',
            'locale',
        ];

        $changes = array_intersect_key($validated, array_flip($allowed));

        if ($changes !== []) {
            $user->update($changes);
        }

        $user->refresh()->load(['studentProfile', 'parentProfile']);

        return $user;
    }

    /**
     * Store an avatar on the `public` disk under `avatars/<user>/...` and
     * persist the resulting URL on the user. Replaces any prior avatar so
     * orphaned files don't accumulate.
     */
    public function uploadAvatar(User $user, UploadedFile $file): User
    {
        // Delete previous avatar if it lives on our public disk.
        if ($user->avatar_url) {
            $prefix = rtrim(Storage::disk('public')->url(''), '/').'/';
            if (str_starts_with($user->avatar_url, $prefix)) {
                $previousPath = substr($user->avatar_url, strlen($prefix));
                Storage::disk('public')->delete($previousPath);
            }
        }

        $extension = $file->extension() ?: $file->getClientOriginalExtension() ?: 'jpg';
        $filename = sprintf('%s.%s', Str::uuid()->toString(), $extension);
        $path = $file->storeAs("avatars/{$user->id}", $filename, 'public');

        if ($path === false) {
            throw new \RuntimeException('Avatar storage failed.');
        }

        $user->update(['avatar_url' => Storage::disk('public')->url($path)]);
        $user->refresh()->load(['studentProfile', 'parentProfile']);

        return $user;
    }

    /**
     * @throws ValidationException
     */
    public function verifyEmail(User $user, string $hash): void
    {
        if (! hash_equals(sha1($user->email ?? ''), $hash)) {
            throw ValidationException::withMessages(['hash' => ['Invalid verification link.']]);
        }

        if ($user->hasVerifiedEmail()) {
            return;
        }

        $user->markEmailAsVerified();
        $this->auditLog->log('auth.email_verified', User::class, $user->id);
    }
}
