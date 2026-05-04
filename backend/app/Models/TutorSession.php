<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TutorSessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorSession extends Model
{
    /** @use HasFactory<TutorSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'started_at',
        'ended_at',
        'last_message_at',
        'message_count',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'last_message_at' => 'datetime',
        'message_count' => 'integer',
    ];

    /** @return BelongsTo<User, TutorSession> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<TutorMessage, TutorSession> */
    public function messages(): HasMany
    {
        return $this->hasMany(TutorMessage::class)->orderBy('created_at');
    }
}
