<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'display_name' => $this->display_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar_url' => $this->avatar_url,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'user_type' => $this->user_type->value,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'phone_verified_at' => $this->phone_verified_at?->toISOString(),
            'last_login_at' => $this->last_login_at?->toISOString(),
            'student_profile' => $this->whenLoaded('studentProfile', fn () => StudentProfileResource::make($this->studentProfile)),
            'parent_profile' => $this->whenLoaded('parentProfile', fn () => ParentProfileResource::make($this->parentProfile)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
