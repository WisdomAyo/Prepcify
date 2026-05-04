<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Support\Enums\QuestionStatus;
use Illuminate\Support\Facades\Schema;

class ContentIntegrityService
{
    /**
     * Flag existing attempts for regrade when a published question's answer changes.
     * No-ops if the question_attempts table does not yet exist (arrives in M4).
     */
    public function flagAttemptsForRegrade(Question $question): void
    {
        if (! Schema::hasTable('attempts')) {
            return;
        }

        \DB::table('attempts')
            ->where('question_id', $question->id)
            ->update(['requires_regrade' => true]);

        $question->update(['status' => QuestionStatus::FlaggedForRegrade]);
    }
}
