<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaperSection extends Model
{
    protected $fillable = [
        'exam_paper_id',
        'title',
        'instructions',
        'sort_order',
    ];

    /** @return BelongsTo<ExamPaper, PaperSection> */
    public function examPaper(): BelongsTo
    {
        return $this->belongsTo(ExamPaper::class);
    }

    /** @return HasMany<Question> */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
