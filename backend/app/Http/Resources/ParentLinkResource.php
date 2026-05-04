<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ParentLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ParentLink */
class ParentLinkResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'invited_by' => $this->invited_by,
            'permissions' => $this->permissions,
            'linked_at' => $this->linked_at,
            'parent' => [
                'id' => $this->parent?->id,
                'display_name' => $this->parent?->display_name,
            ],
            'student' => [
                'id' => $this->student?->id,
                'display_name' => $this->student?->display_name,
            ],
            'created_at' => $this->created_at,
        ];
    }
}
