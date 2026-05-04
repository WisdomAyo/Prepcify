<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Question;
use App\Models\QuestionReport;
use App\Models\User;
use App\Support\Enums\ReportReason;
use App\Support\Enums\ReportStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<QuestionReport> */
class QuestionReportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'question_id' => Question::factory(),
            'reported_by' => User::factory(),
            'reason' => $this->faker->randomElement(ReportReason::cases())->value,
            'detail' => $this->faker->optional()->sentence(),
            'status' => ReportStatus::Open,
            'resolved_by' => null,
            'resolution_notes' => null,
            'resolved_at' => null,
        ];
    }

    public function resolved(): static
    {
        return $this->state([
            'status' => ReportStatus::Resolved,
            'resolved_at' => now(),
        ]);
    }
}
