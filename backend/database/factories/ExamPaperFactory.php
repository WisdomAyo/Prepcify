<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamBody;
use App\Models\ExamPaper;
use App\Models\Subject;
use App\Support\Enums\PaperType;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamPaper> */
class ExamPaperFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_body_id' => ExamBody::factory(),
            'subject_id' => Subject::factory(),
            'year' => $this->faker->numberBetween(2015, 2024),
            'paper_number' => 1,
            'paper_type' => PaperType::Objective,
            'title' => $this->faker->words(4, true),
            'duration_minutes' => 120,
            'total_marks' => 100,
            'instructions_general' => null,
            'syllabus_version' => '1.0',
        ];
    }
}
