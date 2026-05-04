<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\QuestionDiagram;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin QuestionDiagram */
class QuestionDiagramResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'storage_path' => $this->storage_path,
            'alt_text' => $this->alt_text,
            'sort_order' => $this->sort_order,
            'labels' => $this->whenLoaded('labels', fn () => $this->labels->map(fn ($l) => [
                'id' => $l->id,
                'label' => $l->label,
                'x_pct' => $l->x_pct,
                'y_pct' => $l->y_pct,
            ])),
        ];
    }
}
