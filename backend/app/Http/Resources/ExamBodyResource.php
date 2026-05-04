<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExamBody;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExamBody */
class ExamBodyResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'category' => $this->category->value,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'sort_order' => $this->sort_order,
        ];
    }
}
