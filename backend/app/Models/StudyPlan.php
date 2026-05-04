<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyPlan extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'generated_at',
        'expires_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'content' => 'array',
        'generated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /** @return BelongsTo<User, StudyPlan> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
