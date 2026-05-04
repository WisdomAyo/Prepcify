<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    protected $fillable = [
        'user_id',
        'target_exam_date',
        'target_score',
        'daily_goal_minutes',
        'school',
        'grade_level',
        'onboarding_completed_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'target_exam_date' => 'date',
        'onboarding_completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
