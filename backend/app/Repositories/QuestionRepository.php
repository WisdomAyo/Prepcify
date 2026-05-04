<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Question;
use App\Support\Enums\QuestionStatus;
use App\Support\ValueObjects\UserContext;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Collection;

class QuestionRepository
{
    private const PER_PAGE = 20;

    /**
     * Paginated published questions scoped to the user's exam subjects and topics.
     *
     * @param  array<string, mixed>  $filters
     */
    public function forUserContext(UserContext $context, array $filters = []): CursorPaginator
    {
        $query = Question::with(['options', 'diagrams', 'topics', 'tagRows'])
            ->whereIn('exam_subject_id', $context->examSubjectIds)
            ->where('status', QuestionStatus::Published);

        if (isset($filters['topic_id'])) {
            $query->whereHas('topics', fn ($q) => $q->where('topics.id', (int) $filters['topic_id']));
        }

        if (isset($filters['format'])) {
            $query->where('format', $filters['format']);
        }

        if (isset($filters['year'])) {
            $query->where('year', (int) $filters['year']);
        }

        return $query
            ->orderBy('id')
            ->cursorPaginate(self::PER_PAGE);
    }

    /** @return Collection<int, Question> */
    public function byTopic(int $topicId, int $limit = 20): Collection
    {
        return Question::with(['options', 'diagrams'])
            ->whereHas('topics', fn ($q) => $q->where('topics.id', $topicId))
            ->where('status', QuestionStatus::Published)
            ->limit($limit)
            ->get();
    }

    /** @return Collection<int, Question> */
    public function byPaper(int $paperSectionId): Collection
    {
        return Question::with(['options', 'subQuestions.options', 'diagrams'])
            ->where('paper_section_id', $paperSectionId)
            ->where('status', QuestionStatus::Published)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Stub: returns questions from the same exam subject.
     * Full similarity logic (embedding-based) deferred to Milestone 6.
     *
     * @return Collection<int, Question>
     */
    public function similarQuestions(Question $question, int $limit = 5): Collection
    {
        return Question::with(['options'])
            ->where('exam_subject_id', $question->exam_subject_id)
            ->where('id', '!=', $question->id)
            ->where('status', QuestionStatus::Published)
            ->inRandomOrder()
            ->limit($limit)
            ->get();
    }
}
