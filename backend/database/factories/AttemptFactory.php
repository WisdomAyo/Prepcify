<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Attempt;
use App\Models\Question;
use App\Models\User;
use App\Support\Enums\AttemptContext;
use App\Support\Enums\AttemptType;
use App\Support\Enums\GradedBy;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Attempt> */
class AttemptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'question_id' => Question::factory(),
            'sub_question_id' => null,
            'attempt_type' => AttemptType::Mcq,
            'selected_option_id' => null,
            'response_text' => null,
            'response_media_url' => null,
            'marks_awarded' => 1.00,
            'marks_available' => 1.00,
            'is_correct' => true,
            'graded_by' => GradedBy::System,
            'graded_at' => now(),
            'grading_breakdown' => null,
            'time_spent_ms' => $this->faker->numberBetween(5000, 120000),
            'context' => AttemptContext::Drill,
            'client_uuid' => $this->faker->uuid(),
            'requires_regrade' => false,
            'attempted_at' => now(),
        ];
    }

    public function incorrect(): static
    {
        return $this->state([
            'is_correct' => false,
            'marks_awarded' => 0.00,
        ]);
    }

    public function ungraded(): static
    {
        return $this->state([
            'attempt_type' => AttemptType::Essay,
            'is_correct' => null,
            'marks_awarded' => null,
            'graded_by' => null,
            'graded_at' => null,
        ]);
    }

    public function recent(): static
    {
        return $this->state(['attempted_at' => now()->subDays(rand(0, 29))]);
    }

    public function old(): static
    {
        return $this->state(['attempted_at' => now()->subDays(rand(31, 365))]);
    }
}
