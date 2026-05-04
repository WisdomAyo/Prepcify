<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Enums\MissionRecurrence;
use Database\Factories\MissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mission extends Model
{
    /** @use HasFactory<MissionFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'code',
        'name',
        'description',
        'target',
        'reward_xp',
        'recurrence',
        'exam_body_id',
        'subject_id',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'recurrence' => MissionRecurrence::class,
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
}
