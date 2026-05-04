<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\ExamCategory;
use Database\Factories\ExamBodyFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamBody extends Model
{
    /** @use HasFactory<ExamBodyFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category',
        'description',
        'logo_url',
        'status',
        'config',
        'sort_order',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'category' => ExamCategory::class,
        'config' => 'array',
        'sort_order' => 'integer',
    ];

    /** @param Builder<ExamBody> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 'active');
    }

    /** @param Builder<ExamBody> $query */
    public function scopeByCategory(Builder $query, ExamCategory $category): void
    {
        $query->where('category', $category->value);
    }

    /** @return HasMany<ExamSubject> */
    public function examSubjects(): HasMany
    {
        return $this->hasMany(ExamSubject::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'exam_subjects')
            ->withPivot(['is_compulsory', 'syllabus_version', 'syllabus_effective_from', 'syllabus_effective_to'])
            ->withTimestamps();
    }

    /** @return HasMany<ExamPaper> */
    public function examPapers(): HasMany
    {
        return $this->hasMany(ExamPaper::class);
    }

    /** @return HasMany<UserExamTarget> */
    public function userTargets(): HasMany
    {
        return $this->hasMany(UserExamTarget::class);
    }
}
