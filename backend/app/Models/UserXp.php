<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserXp extends Model
{
    protected $table = 'user_xp';

    public $incrementing = false;

    protected $primaryKey = 'user_id';

    public $timestamps = false;

    const UPDATED_AT = 'updated_at';

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'total_xp',
        'level',
        'xp_this_week',
        'week_starts_at',
        'updated_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'week_starts_at' => 'date',
        'updated_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
