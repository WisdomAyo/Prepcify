<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubQuestion extends Model
{
    protected $fillable = [
        'question_id',
        'label',
        'stem',
        'explanation',
        'marks',
        'sort_order',
        'correct_option_id',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'correct_option_id' => 'integer',
        'marks' => 'integer',
        'sort_order' => 'integer',
    ];

    /** @return BelongsTo<Question, SubQuestion> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /** @return HasMany<QuestionOption> */
    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class)->orderBy('sort_order');
    }
}
