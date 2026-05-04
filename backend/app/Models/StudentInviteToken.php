<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentInviteToken extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'created_by_parent_id',
        'invited_name',
        'invited_contact',
        'token',
        'claimed',
        'claimed_by_user_id',
        'expires_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'claimed' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function createdByParent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_parent_id');
    }

    /** @return BelongsTo<User, $this> */
    public function claimedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_user_id');
    }
}
