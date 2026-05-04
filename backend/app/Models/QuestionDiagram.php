<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionDiagram extends Model
{
    protected $fillable = [
        'question_id',
        'storage_path',
        'alt_text',
        'sort_order',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'sort_order' => 'integer',
    ];

    /** @return BelongsTo<Question, QuestionDiagram> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /** @return HasMany<QuestionDiagramLabel> */
    public function labels(): HasMany
    {
        return $this->hasMany(QuestionDiagramLabel::class);
    }
}
