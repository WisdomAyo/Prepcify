<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionTag extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $table = 'question_tags';

    protected $fillable = ['question_id', 'tag'];

    /** @return BelongsTo<Question, QuestionTag> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
