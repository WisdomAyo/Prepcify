<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMission extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'mission_id',
        'progress',
        'target',
        'completed_at',
        'period_key',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'completed_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Mission, $this> */
    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }
}
