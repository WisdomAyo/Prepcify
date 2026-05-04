<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Mission;
use App\Support\Enums\MissionRecurrence;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mission>
 */
class MissionFactory extends Factory
{
    protected $model = Mission::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->slug(2),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'target' => fake()->numberBetween(3, 20),
            'reward_xp' => fake()->numberBetween(10, 100),
            'recurrence' => MissionRecurrence::Daily->value,
            'exam_body_id' => null,
            'subject_id' => null,
        ];
    }

    public function weekly(): static
    {
        return $this->state(fn () => ['recurrence' => MissionRecurrence::Weekly->value]);
    }

    public function once(): static
    {
        return $this->state(fn () => ['recurrence' => MissionRecurrence::Once->value]);
    }
}
