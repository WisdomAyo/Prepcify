<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\DiscountType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'currency',
        'valid_from',
        'valid_until',
        'max_uses',
        'used_count',
        'active',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'discount_type' => DiscountType::class,
        'discount_value' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'active' => 'boolean',
    ];

    /** @return HasMany<UserCoupon> */
    public function userCoupons(): HasMany
    {
        return $this->hasMany(UserCoupon::class);
    }
}
