<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\StudySession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudySession */
class StudySessionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'context' => $this->context->value,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'questions_attempted' => $this->questions_attempted,
            'questions_correct' => $this->questions_correct,
            'xp_earned' => $this->xp_earned,
        ];
    }
}
