<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionDraft;
use App\Models\User;
use App\Support\Enums\DraftStatus;
use App\Support\Enums\QuestionStatus;
use Illuminate\Validation\ValidationException;

class QuestionPublishingService
{
    public function __construct(
        private readonly AuditLogService $audit,
    ) {}

    public function approveDraft(QuestionDraft $draft, User $reviewer, ?string $notes = null): Question
    {
        if (! in_array($draft->status, [DraftStatus::Pending, DraftStatus::UnderReview, DraftStatus::Escalated], true)) {
            throw ValidationException::withMessages(['draft' => 'Draft is not in a reviewable state.']);
        }

        $draft->update([
            'status' => DraftStatus::Approved,
            'assigned_reviewer_id' => $reviewer->id,
            'reviewer_notes' => $notes,
            'reviewed_at' => now(),
        ]);

        $question = Question::findOrFail($draft->question_id);
        $question->update(['status' => QuestionStatus::Published]);

        $this->audit->log(
            action: 'content.draft.approved',
            targetType: QuestionDraft::class,
            targetId: $draft->id,
            actor: $reviewer,
        );

        return $question;
    }

    public function rejectDraft(QuestionDraft $draft, User $reviewer, string $notes): QuestionDraft
    {
        if (! in_array($draft->status, [DraftStatus::Pending, DraftStatus::UnderReview, DraftStatus::Escalated], true)) {
            throw ValidationException::withMessages(['draft' => 'Draft is not in a reviewable state.']);
        }

        $draft->update([
            'status' => DraftStatus::Rejected,
            'assigned_reviewer_id' => $reviewer->id,
            'reviewer_notes' => $notes,
            'reviewed_at' => now(),
        ]);

        $this->audit->log(
            action: 'content.draft.rejected',
            targetType: QuestionDraft::class,
            targetId: $draft->id,
            actor: $reviewer,
        );

        return $draft;
    }

    public function escalateDraft(QuestionDraft $draft, User $reviewer, ?string $notes = null): QuestionDraft
    {
        $draft->update([
            'status' => DraftStatus::Escalated,
            'assigned_reviewer_id' => $reviewer->id,
            'reviewer_notes' => $notes,
        ]);

        $this->audit->log(
            action: 'content.draft.escalated',
            targetType: QuestionDraft::class,
            targetId: $draft->id,
            actor: $reviewer,
        );

        return $draft;
    }

    public function publishQuestion(Question $question, User $actor): Question
    {
        $question->update(['status' => QuestionStatus::Published]);

        $this->audit->log(
            action: 'content.question.published',
            targetType: Question::class,
            targetId: $question->id,
            actor: $actor,
        );

        return $question;
    }
}
