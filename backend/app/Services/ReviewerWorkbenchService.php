<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\QuestionDraft;
use App\Models\ReviewerAction;
use App\Models\User;
use App\Support\Enums\DraftStatus;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ReviewerWorkbenchService
{
    public function nextPending(User $reviewer): ?QuestionDraft
    {
        return QuestionDraft::where('status', DraftStatus::Pending)
            ->with(['question', 'submitter'])
            ->oldest('submitted_at')
            ->first();
    }

    public function approve(User $reviewer, int $draftId, ?int $durationMs = null): QuestionDraft
    {
        $draft = $this->getDraft($reviewer, $draftId);

        $draft->update([
            'status' => DraftStatus::Approved,
            'reviewed_at' => now(),
        ]);

        $this->record($reviewer, $draft, 'approve', $durationMs);

        return $draft->refresh();
    }

    public function reject(User $reviewer, int $draftId, ?string $notes = null, ?int $durationMs = null): QuestionDraft
    {
        $draft = $this->getDraft($reviewer, $draftId);

        $draft->update([
            'status' => DraftStatus::Rejected,
            'reviewer_notes' => $notes,
            'reviewed_at' => now(),
        ]);

        $this->record($reviewer, $draft, 'reject', $durationMs);

        return $draft->refresh();
    }

    public function escalate(User $reviewer, int $draftId, ?string $notes = null, ?int $durationMs = null): QuestionDraft
    {
        $draft = $this->getDraft($reviewer, $draftId);

        $draft->update([
            'status' => DraftStatus::Escalated,
            'reviewer_notes' => $notes,
            'reviewed_at' => now(),
        ]);

        $this->record($reviewer, $draft, 'escalate', $durationMs);

        return $draft->refresh();
    }

    public function skip(User $reviewer, int $draftId, ?int $durationMs = null): QuestionDraft
    {
        $draft = $this->getDraft($reviewer, $draftId);

        $this->record($reviewer, $draft, 'skip', $durationMs);

        return $draft;
    }

    private function getDraft(User $reviewer, int $draftId): QuestionDraft
    {
        $draft = QuestionDraft::with(['question', 'submitter'])->findOrFail($draftId);

        if (
            $draft->status === DraftStatus::Approved ||
            $draft->status === DraftStatus::Rejected
        ) {
            throw new AccessDeniedHttpException('Draft is already finalized.');
        }

        return $draft;
    }

    private function record(User $reviewer, QuestionDraft $draft, string $action, ?int $durationMs): void
    {
        ReviewerAction::create([
            'reviewer_id' => $reviewer->id,
            'draft_id' => $draft->id,
            'action' => $action,
            'duration_ms' => $durationMs,
            'created_at' => now(),
        ]);
    }
}
