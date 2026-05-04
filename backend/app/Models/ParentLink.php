<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\ParentLinkInvitedBy;
use App\Support\Enums\ParentLinkStatus;
use Database\Factories\ParentLinkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentLink extends Model
{
    /** @use HasFactory<ParentLinkFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'parent_user_id',
        'student_user_id',
        'status',
        'invited_by',
        'permissions',
        'linked_at',
        'last_viewed_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'status' => ParentLinkStatus::class,
        'invited_by' => ParentLinkInvitedBy::class,
        'permissions' => 'array',
        'linked_at' => 'datetime',
        'last_viewed_at' => 'datetime',
    ];

    /** @return BelongsTo<User, $this> */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }
}
