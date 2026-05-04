<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserSubjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSubject extends Model
{
    /** @use HasFactory<UserSubjectFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'exam_body_id',
        'subject_id',
        'active',
        'deactivated_at',
        'created_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'active' => 'boolean',
        'deactivated_at' => 'datetime',
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

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
