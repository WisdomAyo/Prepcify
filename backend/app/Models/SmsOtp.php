<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsOtp extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'phone',
        'code',
        'expires_at',
        'verified_at',
        'created_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }
}
