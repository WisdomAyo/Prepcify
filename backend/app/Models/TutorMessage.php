<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\MessageRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorMessage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'tutor_session_id',
        'role',
        'content',
        'tokens_used',
        'created_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'role' => MessageRole::class,
        'tokens_used' => 'integer',
        'created_at' => 'datetime',
    ];

    /** @return BelongsTo<TutorSession, TutorMessage> */
    public function session(): BelongsTo
    {
        return $this->belongsTo(TutorSession::class, 'tutor_session_id');
    }
}
