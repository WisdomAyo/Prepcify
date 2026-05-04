<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\QuestionOptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionOption extends Model
{
    /** @use HasFactory<QuestionOptionFactory> */
    use HasFactory;

    protected $fillable = [
        'question_id',
        'sub_question_id',
        'label',
        'body',
        'sort_order',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'sort_order' => 'integer',
    ];

    /** @return BelongsTo<Question, QuestionOption> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /** @return BelongsTo<SubQuestion, QuestionOption> */
    public function subQuestion(): BelongsTo
    {
        return $this->belongsTo(SubQuestion::class);
    }
}
