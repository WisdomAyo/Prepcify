<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->slug(2),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'entitlements' => [
                'ai_tutor_messages_per_day' => 10,
                'mock_exams_per_month' => 5,
            ],
            'active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }

    public function free(): static
    {
        return $this->state(fn () => [
            'code' => 'free',
            'name' => 'Free',
            'entitlements' => [
                'ai_tutor_messages_per_day' => 3,
                'mock_exams_per_month' => 1,
            ],
            'sort_order' => 0,
        ]);
    }

    public function pro(): static
    {
        return $this->state(fn () => [
            'code' => 'pro',
            'name' => 'Pro',
            'entitlements' => [
                'ai_tutor_messages_per_day' => 50,
                'mock_exams_per_month' => 30,
            ],
            'sort_order' => 1,
        ]);
    }
}
