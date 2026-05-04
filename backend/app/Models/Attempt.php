<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\AttemptContext;
use App\Support\Enums\AttemptType;
use App\Support\Enums\GradedBy;
use Database\Factories\AttemptFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attempt extends Model
{
    /** @use HasFactory<AttemptFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'question_id',
        'sub_question_id',
        'attempt_type',
        'selected_option_id',
        'response_text',
        'response_media_url',
        'marks_awarded',
        'marks_available',
        'is_correct',
        'graded_by',
        'graded_at',
        'grading_breakdown',
        'time_spent_ms',
        'context',
        'client_uuid',
        'requires_regrade',
        'attempted_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'attempt_type' => AttemptType::class,
        'context' => AttemptContext::class,
        'graded_by' => GradedBy::class,
        'grading_breakdown' => 'array',
        'is_correct' => 'boolean',
        'requires_regrade' => 'boolean',
        'marks_awarded' => 'decimal:2',
        'marks_available' => 'decimal:2',
        'graded_at' => 'datetime',
        'attempted_at' => 'datetime',
    ];

    /** @return BelongsTo<User, Attempt> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Question, Attempt> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /** @return BelongsTo<SubQuestion, Attempt> */
    public function subQuestion(): BelongsTo
    {
        return $this->belongsTo(SubQuestion::class);
    }
}
