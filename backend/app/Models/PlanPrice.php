<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\BillingInterval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanPrice extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'plan_id',
        'currency',
        'amount_minor',
        'interval',
        'paystack_plan_code',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'interval' => BillingInterval::class,
    ];

    /** @return BelongsTo<Plan, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
