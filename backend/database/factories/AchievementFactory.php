<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Achievement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Achievement>
 */
class AchievementFactory extends Factory
{
    protected $model = Achievement::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->slug(2),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'icon_url' => null,
            'exam_body_id' => null,
            'subject_id' => null,
            'criteria' => ['type' => 'streak', 'threshold' => 7],
        ];
    }
}
