<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentProfile extends Model
{
    protected $fillable = [
        'user_id',
    ];

    /** @return BelongsTo<User, ParentProfile> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
