<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\MockExam;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin MockExam */
class MockExamResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'exam_body_id' => $this->exam_body_id,
            'subject_ids' => $this->subject_ids,
            'status' => $this->status->value,
            'started_at' => $this->started_at,
            'submitted_at' => $this->submitted_at,
            'total_score' => $this->total_score,
            'max_score' => $this->max_score,
            'percentile' => $this->percentile,
            'breakdown' => $this->breakdown,
        ];
    }
}
