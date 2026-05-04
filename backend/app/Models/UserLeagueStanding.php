<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLeagueStanding extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'league_group_id',
        'xp_in_period',
        'rank',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<LeagueGroup, $this> */
    public function leagueGroup(): BelongsTo
    {
        return $this->belongsTo(LeagueGroup::class);
    }
}
