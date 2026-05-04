<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\PaperType;
use Database\Factories\ExamPaperFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPaper extends Model
{
    /** @use HasFactory<ExamPaperFactory> */
    use HasFactory;

    protected $fillable = [
        'exam_body_id',
        'subject_id',
        'year',
        'paper_number',
        'paper_type',
        'title',
        'duration_minutes',
        'total_marks',
        'instructions_general',
        'syllabus_version',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'paper_type' => PaperType::class,
        'year' => 'integer',
        'paper_number' => 'integer',
        'duration_minutes' => 'integer',
        'total_marks' => 'integer',
    ];

    public function examBody(): BelongsTo
    {
        return $this->belongsTo(ExamBody::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /** @return HasMany<PaperSection> */
    public function sections(): HasMany
    {
        return $this->hasMany(PaperSection::class)->orderBy('sort_order');
    }
}
