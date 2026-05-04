<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<QuestionOption> */
class QuestionOptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'question_id' => Question::factory(),
            'sub_question_id' => null,
            'label' => $this->faker->randomElement(['A', 'B', 'C', 'D']),
            'body' => $this->faker->sentence(),
            'sort_order' => $this->faker->numberBetween(0, 3),
        ];
    }
}
