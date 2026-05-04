<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'name',
        'period_start',
        'period_end',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    /** @return HasMany<LeagueGroup> */
    public function groups(): HasMany
    {
        return $this->hasMany(LeagueGroup::class);
    }
}
