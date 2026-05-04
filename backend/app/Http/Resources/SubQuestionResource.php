<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\SubQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SubQuestion */
class SubQuestionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'stem' => $this->stem,
            'marks' => $this->marks,
            'sort_order' => $this->sort_order,
            'options' => QuestionOptionResource::collection($this->whenLoaded('options')),
            'correct_option_id' => $this->whenNotNull($this->correct_option_id),
        ];
    }
}
