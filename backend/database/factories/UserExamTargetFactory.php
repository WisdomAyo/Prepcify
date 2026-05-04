<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamBody;
use App\Models\User;
use App\Models\UserExamTarget;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<UserExamTarget> */
class UserExamTargetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'exam_body_id' => ExamBody::factory(),
            'target_date' => $this->faker->dateTimeBetween('+1 month', '+2 years')->format('Y-m-d'),
            'priority' => $this->faker->numberBetween(1, 5),
            'created_at' => now(),
        ];
    }
}
