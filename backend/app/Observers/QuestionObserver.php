<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Question;
use App\Services\ExplanationService;

class QuestionObserver
{
    public function updated(Question $question): void
    {
        // Invalidate the cached AI explanation when question content changes
        if ($question->isDirty(['stem', 'explanation', 'correct_option_id'])) {
            ExplanationService::invalidate($question->id);
        }
    }

    public function deleted(Question $question): void
    {
        ExplanationService::invalidate($question->id);
    }
}
