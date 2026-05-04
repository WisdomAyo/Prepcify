<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Subscription */
class SubscriptionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'started_at' => $this->started_at,
            'current_period_start' => $this->current_period_start,
            'current_period_end' => $this->current_period_end,
            'cancelled_at' => $this->cancelled_at,
            'plan' => $this->whenLoaded('plan', fn () => $this->plan === null ? null : [
                'code' => $this->plan->code,
                'name' => $this->plan->name,
                'entitlements' => $this->plan->entitlements,
            ]),
        ];
    }
}
