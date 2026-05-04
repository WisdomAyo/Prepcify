<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\QuestionFormat;
use App\Support\Enums\QuestionStatus;
use Database\Factories\QuestionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property-read Collection<int, Topic> $topics
 * @property-read Collection<int, QuestionTag> $tagRows
 */
class Question extends Model
{
    /** @use HasFactory<QuestionFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'exam_subject_id',
        'paper_section_id',
        'format',
        'status',
        'stem',
        'explanation',
        'year',
        'marks',
        'sort_order',
        'correct_option_id',
        'created_by',
        'embedding',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'format' => QuestionFormat::class,
        'status' => QuestionStatus::class,
        'correct_option_id' => 'integer',
        'marks' => 'integer',
        'sort_order' => 'integer',
        'year' => 'integer',
        'embedding' => 'array',
    ];

    /** @param Builder<Question> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', QuestionStatus::Published->value);
    }

    /** @param Builder<Question> $query */
    public function scopeForExamSubject(Builder $query, int $examSubjectId): void
    {
        $query->where('exam_subject_id', $examSubjectId);
    }

    /** @return BelongsTo<ExamSubject, Question> */
    public function examSubject(): BelongsTo
    {
        return $this->belongsTo(ExamSubject::class);
    }

    /** @return BelongsTo<PaperSection, Question> */
    public function paperSection(): BelongsTo
    {
        return $this->belongsTo(PaperSection::class);
    }

    /** @return BelongsTo<User, Question> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<QuestionOption> */
    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class)->orderBy('sort_order');
    }

    /** @return HasMany<SubQuestion> */
    public function subQuestions(): HasMany
    {
        return $this->hasMany(SubQuestion::class)->orderBy('sort_order');
    }

    /** @return HasMany<QuestionDiagram> */
    public function diagrams(): HasMany
    {
        return $this->hasMany(QuestionDiagram::class)->orderBy('sort_order');
    }

    public function topics(): BelongsToMany
    {
        return $this->belongsToMany(Topic::class, 'question_topics')
            ->withPivot(['source', 'confidence'])
            ->withTimestamps();
    }

    /** @return HasMany<QuestionTag> */
    public function tagRows(): HasMany
    {
        return $this->hasMany(QuestionTag::class);
    }

    /** @return HasOne<QuestionDraft> */
    public function draft(): HasOne
    {
        return $this->hasOne(QuestionDraft::class)->latestOfMany();
    }

    /** @return HasMany<QuestionReport> */
    public function reports(): HasMany
    {
        return $this->hasMany(QuestionReport::class);
    }
}
