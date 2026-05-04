<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\AttemptContext;
use Database\Factories\StudySessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudySession extends Model
{
    /** @use HasFactory<StudySessionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'started_at',
        'ended_at',
        'questions_attempted',
        'questions_correct',
        'xp_earned',
        'context',
        'metadata',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'context' => AttemptContext::class,
        'metadata' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    /** @return BelongsTo<User, StudySession> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
