<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\DraftStatus;
use Database\Factories\QuestionDraftFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionDraft extends Model
{
    /** @use HasFactory<QuestionDraftFactory> */
    use HasFactory;

    protected $fillable = [
        'question_id',
        'submitted_by',
        'assigned_reviewer_id',
        'status',
        'reviewer_notes',
        'submitted_at',
        'reviewed_at',
        'ingestion_job_id',
        'source_page_url',
        'source_page_number',
        'extraction_confidence',
        'raw_extraction',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'status' => DraftStatus::class,
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'source_page_number' => 'integer',
        'extraction_confidence' => 'float',
        'raw_extraction' => 'array',
    ];

    /** @return BelongsTo<Question, QuestionDraft> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /** @return BelongsTo<User, QuestionDraft> */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /** @return BelongsTo<User, QuestionDraft> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_reviewer_id');
    }

    /** @return BelongsTo<IngestionJob, QuestionDraft> */
    public function ingestionJob(): BelongsTo
    {
        return $this->belongsTo(IngestionJob::class);
    }
}
