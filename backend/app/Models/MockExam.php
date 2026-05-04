<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\MockExamStatus;
use Database\Factories\MockExamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MockExam extends Model
{
    /** @use HasFactory<MockExamFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exam_body_id',
        'subject_ids',
        'started_at',
        'submitted_at',
        'total_score',
        'max_score',
        'percentile',
        'breakdown',
        'status',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'subject_ids' => 'array',
        'breakdown' => 'array',
        'status' => MockExamStatus::class,
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'total_score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentile' => 'decimal:2',
    ];

    /** @return BelongsTo<User, MockExam> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<ExamBody, MockExam> */
    public function examBody(): BelongsTo
    {
        return $this->belongsTo(ExamBody::class);
    }
}
