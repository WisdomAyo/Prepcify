<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SmsOtp;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OtpService
{
    private const EXPIRY_MINUTES = 10;

    private const CODE_LENGTH = 6;

    public function generate(User $user, string $phone): SmsOtp
    {
        // Invalidate any existing unexpired OTPs for this phone
        SmsOtp::where('phone', $phone)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->update(['expires_at' => now()]);

        return SmsOtp::create([
            'user_id' => $user->id,
            'phone' => $phone,
            'code' => $this->generateCode(),
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES),
            'created_at' => now(),
        ]);
    }

    public function send(User $user, string $phone): void
    {
        $otp = $this->generate($user, $phone);
        $this->sendViaSms($phone, $otp->code);
    }

    public function verify(User $user, string $phone, string $code): bool
    {
        $otp = SmsOtp::where('user_id', $user->id)
            ->where('phone', $phone)
            ->where('code', $code)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($otp === null) {
            return false;
        }

        $otp->update(['verified_at' => now()]);

        return true;
    }

    /**
     * @throws ValidationException
     */
    public function verifyAndActivate(User $user, string $phone, string $code): User
    {
        if (! $this->verify($user, $phone, $code)) {
            throw ValidationException::withMessages([
                'code' => ['The OTP is invalid or has expired.'],
            ]);
        }

        $user->update([
            'phone' => $phone,
            'phone_verified_at' => now(),
        ]);

        $user->refresh();

        return $user;
    }

    // SMS provider is stubbed — logs the OTP for testing.
    // Replace this method body with real SMS provider in a future milestone.
    public function sendViaSms(string $phone, string $code): void
    {
        Log::channel('single')->info('OTP SMS (stub)', [
            'phone' => $phone,
            'code' => $code,
        ]);
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, (int) str_repeat('9', self::CODE_LENGTH)), self::CODE_LENGTH, '0', STR_PAD_LEFT);
    }
}
