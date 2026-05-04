<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ParentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ParentProfile */
class ParentProfileResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
