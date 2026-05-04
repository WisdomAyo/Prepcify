<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\QuestionOption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin QuestionOption */
class QuestionOptionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'body' => $this->body,
            'sort_order' => $this->sort_order,
        ];
    }
}
