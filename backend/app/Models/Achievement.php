<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\AchievementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Achievement extends Model
{
    /** @use HasFactory<AchievementFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'code',
        'name',
        'description',
        'icon_url',
        'exam_body_id',
        'subject_id',
        'criteria',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'criteria' => 'array',
    ];

    /** @return BelongsTo<ExamBody, $this> */
    public function examBody(): BelongsTo
    {
        return $this->belongsTo(ExamBody::class);
    }

    /** @return BelongsTo<Subject, $this> */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('earned_at');
    }
}
