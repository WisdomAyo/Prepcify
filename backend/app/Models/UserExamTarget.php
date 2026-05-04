<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserExamTargetFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserExamTarget extends Model
{
    /** @use HasFactory<UserExamTargetFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'exam_body_id',
        'target_date',
        'priority',
        'created_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'target_date' => 'date',
        'priority' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function examBody(): BelongsTo
    {
        return $this->belongsTo(ExamBody::class);
    }
}
