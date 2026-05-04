<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStreak extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'user_id';

    public $timestamps = false;

    const UPDATED_AT = 'updated_at';

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'current_streak',
        'longest_streak',
        'last_active_date',
        'freezes_available',
        'updated_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'last_active_date' => 'date',
        'updated_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
