<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamBody;
use App\Models\MockExam;
use App\Models\User;
use App\Support\Enums\MockExamStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MockExam> */
class MockExamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'exam_body_id' => ExamBody::factory(),
            'subject_ids' => [],
            'started_at' => now(),
            'submitted_at' => null,
            'total_score' => null,
            'max_score' => null,
            'percentile' => null,
            'breakdown' => null,
            'status' => MockExamStatus::InProgress,
        ];
    }

    public function submitted(): static
    {
        return $this->state([
            'status' => MockExamStatus::Submitted,
            'submitted_at' => now(),
            'total_score' => 72.00,
            'max_score' => 100.00,
            'percentile' => 65.00,
        ]);
    }

    public function abandoned(): static
    {
        return $this->state(['status' => MockExamStatus::Abandoned]);
    }
}
