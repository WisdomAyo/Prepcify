<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamSubject;
use App\Models\Question;
use App\Support\Enums\QuestionFormat;
use App\Support\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Question> */
class QuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_subject_id' => ExamSubject::factory(),
            'paper_section_id' => null,
            'format' => QuestionFormat::Mcq,
            'status' => QuestionStatus::Published,
            'stem' => $this->faker->sentence().'?',
            'explanation' => $this->faker->optional()->paragraph(),
            'year' => $this->faker->optional()->numberBetween(2010, 2024),
            'marks' => 1,
            'sort_order' => $this->faker->numberBetween(0, 100),
            'correct_option_id' => null,
            'created_by' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => QuestionStatus::Draft]);
    }

    public function mcq(): static
    {
        return $this->state(['format' => QuestionFormat::Mcq]);
    }

    public function theory(): static
    {
        return $this->state(['format' => QuestionFormat::Theory]);
    }
}
