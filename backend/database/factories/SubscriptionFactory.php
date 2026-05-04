<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $start = now()->subDays(15);

        return [
            'user_id' => User::factory(),
            'paid_by_user_id' => null,
            'plan_id' => Plan::factory(),
            'status' => SubscriptionStatus::Active->value,
            'started_at' => $start,
            'current_period_start' => $start,
            'current_period_end' => $start->copy()->addMonth(),
            'cancelled_at' => null,
            'paystack_subscription_code' => null,
            'paystack_customer_code' => null,
            'metadata' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => SubscriptionStatus::Active->value]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => SubscriptionStatus::Cancelled->value,
            'cancelled_at' => now()->subDay(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => SubscriptionStatus::Expired->value,
            'current_period_end' => now()->subDay(),
        ]);
    }
}
