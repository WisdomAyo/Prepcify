<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\QuestionDraft;
use App\Support\Enums\DraftStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class QuestionDraftRepository
{
    private const PER_PAGE = 25;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function listForReview(array $filters = []): LengthAwarePaginator
    {
        $query = QuestionDraft::with(['question.examSubject', 'submitter', 'reviewer'])
            ->whereIn('status', [DraftStatus::Pending->value, DraftStatus::UnderReview->value, DraftStatus::Escalated->value]);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['assigned_reviewer_id'])) {
            $query->where('assigned_reviewer_id', (int) $filters['assigned_reviewer_id']);
        }

        if (isset($filters['exam_subject_id'])) {
            $query->whereHas('question', fn ($q) => $q->where('exam_subject_id', (int) $filters['exam_subject_id']));
        }

        return $query
            ->orderBy('created_at')
            ->paginate(self::PER_PAGE);
    }
}
