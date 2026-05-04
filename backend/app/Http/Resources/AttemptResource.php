<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Attempt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Attempt */
class AttemptResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'sub_question_id' => $this->sub_question_id,
            'attempt_type' => $this->attempt_type->value,
            'selected_option_id' => $this->selected_option_id,
            'is_correct' => $this->is_correct,
            'marks_awarded' => $this->marks_awarded,
            'marks_available' => $this->marks_available,
            'graded_by' => $this->graded_by?->value,
            'context' => $this->context->value,
            'client_uuid' => $this->client_uuid,
            'attempted_at' => $this->attempted_at,
        ];
    }
}
