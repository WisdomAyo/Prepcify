<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Subscription;
use App\Support\Enums\SubscriptionStatus;
use Illuminate\Support\Facades\Cache;

class EntitlementService
{
    private const CACHE_TTL = 3600;

    private const FREE_ENTITLEMENTS = [
        'ai_tutor_messages_per_day' => 3,
        'mock_exams_per_month' => 1,
        'plan_code' => 'free',
    ];

    /** @return array<string, mixed> */
    public function forUser(int $userId): array
    {
        return Cache::remember(
            $this->cacheKey($userId),
            self::CACHE_TTL,
            fn () => $this->resolve($userId),
        );
    }

    public function invalidate(int $userId): void
    {
        Cache::forget($this->cacheKey($userId));
    }

    /** @return array<string, mixed> */
    private function resolve(int $userId): array
    {
        $subscription = Subscription::where('user_id', $userId)
            ->where('status', SubscriptionStatus::Active->value)
            ->where('current_period_end', '>', now())
            ->with('plan')
            ->latest('started_at')
            ->first();

        if ($subscription === null || $subscription->plan === null) {
            return self::FREE_ENTITLEMENTS;
        }

        $entitlements = $subscription->plan->entitlements ?? [];
        $entitlements['plan_code'] = $subscription->plan->code;

        return $entitlements;
    }

    private function cacheKey(int $userId): string
    {
        return 'entitlements:'.$userId;
    }
}
