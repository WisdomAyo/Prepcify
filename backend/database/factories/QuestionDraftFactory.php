<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Question;
use App\Models\QuestionDraft;
use App\Support\Enums\DraftStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<QuestionDraft> */
class QuestionDraftFactory extends Factory
{
    public function definition(): array
    {
        return [
            'question_id' => Question::factory(),
            'submitted_by' => null,
            'assigned_reviewer_id' => null,
            'status' => DraftStatus::Pending,
            'reviewer_notes' => null,
            'submitted_at' => now(),
            'reviewed_at' => null,
        ];
    }

    public function underReview(): static
    {
        return $this->state(['status' => DraftStatus::UnderReview]);
    }

    public function approved(): static
    {
        return $this->state([
            'status' => DraftStatus::Approved,
            'reviewed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state([
            'status' => DraftStatus::Rejected,
            'reviewer_notes' => $this->faker->sentence(),
            'reviewed_at' => now(),
        ]);
    }
}
