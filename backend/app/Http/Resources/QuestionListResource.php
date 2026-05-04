<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Question */
class QuestionListResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'format' => $this->format->value,
            'stem' => $this->stem,
            'marks' => $this->marks,
            'year' => $this->year,
            'options' => QuestionOptionResource::collection($this->whenLoaded('options')),
            'diagrams' => QuestionDiagramResource::collection($this->whenLoaded('diagrams')),
            'topics' => $this->whenLoaded('topics', fn () => $this->topics->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
            ])),
            'tags' => $this->whenLoaded('tagRows', fn () => $this->tagRows->pluck('tag')->values()),
        ];
    }
}
