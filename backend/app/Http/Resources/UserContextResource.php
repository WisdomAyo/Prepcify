<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Support\ValueObjects\UserContext;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserContextResource extends JsonResource
{
    /** @var UserContext */
    public $resource;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
