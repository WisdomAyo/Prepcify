<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudentProfile */
class StudentProfileResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'target_exam_date' => $this->target_exam_date?->toDateString(),
            'target_score' => $this->target_score,
            'daily_goal_minutes' => $this->daily_goal_minutes,
            'school' => $this->school,
            'grade_level' => $this->grade_level,
            'onboarding_completed_at' => $this->onboarding_completed_at?->toISOString(),
        ];
    }
}
