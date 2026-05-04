<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TopicMastery extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'topic_mastery';

    protected $fillable = [
        'user_id',
        'topic_id',
        'mastery_score',
        'confidence',
        'attempts_count',
        'correct_count',
        'total_marks_awarded',
        'total_marks_available',
        'last_attempted_at',
        'updated_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'mastery_score' => 'float',
        'confidence' => 'float',
        'last_attempted_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /** @return BelongsTo<User, TopicMastery> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Topic, TopicMastery> */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }
}
