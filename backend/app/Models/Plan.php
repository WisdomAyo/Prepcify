<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'code',
        'name',
        'description',
        'entitlements',
        'active',
        'sort_order',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'entitlements' => 'array',
        'active' => 'boolean',
    ];

    /** @return HasMany<PlanPrice> */
    public function prices(): HasMany
    {
        return $this->hasMany(PlanPrice::class);
    }

    /** @return HasMany<Subscription> */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
