<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeagueGroup extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'league_id',
        'tier',
    ];

    /** @return BelongsTo<League, $this> */
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    /** @return HasMany<UserLeagueStanding> */
    public function standings(): HasMany
    {
        return $this->hasMany(UserLeagueStanding::class);
    }
}
