<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TopicFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    /** @use HasFactory<TopicFactory> */
    use HasFactory;

    protected $fillable = [
        'exam_subject_id',
        'parent_topic_id',
        'name',
        'slug',
        'path',
        'depth',
        'syllabus_notes',
        'sort_order',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'depth' => 'integer',
        'sort_order' => 'integer',
    ];

    /** @param Builder<Topic> $query */
    public function scopeForExamSubject(Builder $query, int $examSubjectId): void
    {
        $query->where('exam_subject_id', $examSubjectId);
    }

    /** @param Builder<Topic> $query */
    public function scopeRoots(Builder $query): void
    {
        $query->whereNull('parent_topic_id');
    }

    public function examSubject(): BelongsTo
    {
        return $this->belongsTo(ExamSubject::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'parent_topic_id');
    }

    /** @return HasMany<Topic> */
    public function children(): HasMany
    {
        return $this->hasMany(Topic::class, 'parent_topic_id')->orderBy('sort_order');
    }
}
