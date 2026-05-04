<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Plan */
class PlanResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'entitlements' => $this->entitlements,
            'sort_order' => $this->sort_order,
            'prices' => $this->whenLoaded('prices', fn () => $this->prices->map(fn ($price) => [
                'currency' => $price->currency,
                'amount_minor' => $price->amount_minor,
                'interval' => $price->interval,
            ])),
        ];
    }
}
