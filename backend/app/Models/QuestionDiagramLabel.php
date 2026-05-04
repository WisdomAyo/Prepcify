<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionDiagramLabel extends Model
{
    protected $fillable = [
        'question_diagram_id',
        'label',
        'x_pct',
        'y_pct',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'x_pct' => 'float',
        'y_pct' => 'float',
    ];

    /** @return BelongsTo<QuestionDiagram, QuestionDiagramLabel> */
    public function diagram(): BelongsTo
    {
        return $this->belongsTo(QuestionDiagram::class, 'question_diagram_id');
    }
}
