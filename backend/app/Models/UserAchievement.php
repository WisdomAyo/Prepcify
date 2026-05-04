<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAchievement extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'achievement_id',
        'earned_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'earned_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Achievement, $this> */
    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }
}
