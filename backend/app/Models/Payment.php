<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'subscription_id',
        'amount_minor',
        'currency',
        'status',
        'paystack_reference',
        'paid_at',
        'metadata',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'status' => PaymentStatus::class,
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Subscription, $this> */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
