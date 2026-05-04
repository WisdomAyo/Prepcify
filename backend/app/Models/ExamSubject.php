<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ExamSubjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read ExamBody $examBody
 * @property-read Subject $subject
 */
class ExamSubject extends Model
{
    /** @use HasFactory<ExamSubjectFactory> */
    use HasFactory;

    protected $fillable = [
        'exam_body_id',
        'subject_id',
        'is_compulsory',
        'syllabus_version',
        'syllabus_effective_from',
        'syllabus_effective_to',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'is_compulsory' => 'boolean',
        'syllabus_effective_from' => 'date',
        'syllabus_effective_to' => 'date',
    ];

    public function examBody(): BelongsTo
    {
        return $this->belongsTo(ExamBody::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /** @return HasMany<Topic> */
    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class);
    }
}
