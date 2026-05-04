<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewerAction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'reviewer_id',
        'draft_id',
        'action',
        'duration_ms',
        'created_at',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'created_at' => 'datetime',
        'duration_ms' => 'integer',
    ];

    /** @return BelongsTo<User, ReviewerAction> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /** @return BelongsTo<QuestionDraft, ReviewerAction> */
    public function draft(): BelongsTo
    {
        return $this->belongsTo(QuestionDraft::class, 'draft_id');
    }
}
