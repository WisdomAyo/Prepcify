<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\ReportReason;
use App\Support\Enums\ReportStatus;
use Database\Factories\QuestionReportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionReport extends Model
{
    /** @use HasFactory<QuestionReportFactory> */
    use HasFactory;

    protected $fillable = [
        'question_id',
        'reported_by',
        'reason',
        'detail',
        'status',
        'resolved_by',
        'resolution_notes',
        'resolved_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'reason' => ReportReason::class,
        'status' => ReportStatus::class,
        'resolved_at' => 'datetime',
    ];

    /** @return BelongsTo<Question, QuestionReport> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /** @return BelongsTo<User, QuestionReport> */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /** @return BelongsTo<User, QuestionReport> */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
