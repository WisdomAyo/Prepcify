<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SubjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    /** @use HasFactory<SubjectFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function examBodies(): BelongsToMany
    {
        return $this->belongsToMany(ExamBody::class, 'exam_subjects')
            ->withPivot(['is_compulsory', 'syllabus_version', 'syllabus_effective_from', 'syllabus_effective_to'])
            ->withTimestamps();
    }

    /** @return HasMany<ExamSubject> */
    public function examSubjects(): HasMany
    {
        return $this->hasMany(ExamSubject::class);
    }
}
