<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\DB;

class MasteryService
{
    /**
     * Laplace-smoothed mastery with 30-day time-decay weighting.
     *
     * mastery    = (weighted_correct + 2) / (weighted_attempts + 4)
     * confidence = min(1, attempts_count / 20)
     * display    = mastery * confidence + 0.5 * (1 - confidence)
     *
     * Recent (≤30d) attempts count 1.5× in both numerator and denominator.
     */
    public function computeForTopic(int $userId, int $topicId): void
    {
        $cutoff = now()->subDays(30)->toDateTimeString();

        $all = $this->aggregateAttempts($userId, $topicId);

        if ($all->total === 0) {
            return;
        }

        $recent = $this->aggregateAttempts($userId, $topicId, $cutoff);

        $oldTotal = $all->total - $recent->total;
        $oldCorrect = $all->correct - $recent->correct;

        $weightedAttempts = $oldTotal + $recent->total * 1.5;
        $weightedCorrect = $oldCorrect + $recent->correct * 1.5;

        $mastery = ($weightedCorrect + 2) / ($weightedAttempts + 4);
        $confidence = min(1.0, $all->total / 20);
        // display score (used by UI) blends mastery and prior of 0.5
        // stored as mastery_score for simplicity; UI layer applies display formula
        $masteryScore = round($mastery, 3);
        $confidenceScore = round($confidence, 3);

        DB::table('topic_mastery')->updateOrInsert(
            ['user_id' => $userId, 'topic_id' => $topicId],
            [
                'mastery_score' => $masteryScore,
                'confidence' => $confidenceScore,
                'attempts_count' => $all->total,
                'correct_count' => $all->correct,
                'total_marks_awarded' => $all->marks_awarded,
                'total_marks_available' => $all->marks_available,
                'last_attempted_at' => $all->last_attempted_at,
                'updated_at' => now()->toDateTimeString(),
            ],
        );
    }

    /**
     * @return array{mastery_score: float, confidence: float, topics_covered: int, total_topics: int}
     */
    public function computeForUserSubject(int $userId, int $subjectId): array
    {
        $topicIds = DB::table('topics')
            ->join('exam_subjects', 'exam_subjects.id', '=', 'topics.exam_subject_id')
            ->where('exam_subjects.subject_id', $subjectId)
            ->pluck('topics.id')
            ->all();

        return $this->aggregateMastery($userId, $topicIds);
    }

    /**
     * @return array{mastery_score: float, confidence: float, topics_covered: int, total_topics: int}
     */
    public function computeForUserExam(int $userId, int $examBodyId): array
    {
        $topicIds = DB::table('topics')
            ->join('exam_subjects', 'exam_subjects.id', '=', 'topics.exam_subject_id')
            ->where('exam_subjects.exam_body_id', $examBodyId)
            ->pluck('topics.id')
            ->all();

        return $this->aggregateMastery($userId, $topicIds);
    }

    /**
     * Recomputes mastery for every topic the user has attempted.
     * Called by MasteryRecomputeJob when topic_ids is null.
     */
    public function recomputeAllAffectedTopics(int $userId): void
    {
        $topicIds = DB::table('question_topics')
            ->join('attempts', 'attempts.question_id', '=', 'question_topics.question_id')
            ->where('attempts.user_id', $userId)
            ->whereNotNull('attempts.is_correct')
            ->distinct()
            ->pluck('question_topics.topic_id')
            ->all();

        foreach ($topicIds as $topicId) {
            $this->computeForTopic($userId, (int) $topicId);
        }
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    /**
     * @return object{total: int, correct: int, marks_awarded: float, marks_available: float, last_attempted_at: string|null}
     */
    private function aggregateAttempts(int $userId, int $topicId, ?string $since = null): object
    {
        $query = DB::table('attempts')
            ->join('question_topics', 'question_topics.question_id', '=', 'attempts.question_id')
            ->where('attempts.user_id', $userId)
            ->where('question_topics.topic_id', $topicId)
            ->whereNotNull('attempts.is_correct')
            ->selectRaw(
                'COUNT(*) as total,
                 SUM(CASE WHEN attempts.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                 SUM(COALESCE(attempts.marks_awarded, 0)) as marks_awarded,
                 SUM(COALESCE(attempts.marks_available, 0)) as marks_available,
                 MAX(attempts.attempted_at) as last_attempted_at',
            );

        if ($since !== null) {
            $query->where('attempts.attempted_at', '>=', $since);
        }

        $row = $query->first();

        return (object) [
            'total' => (int) ($row->total ?? 0),
            'correct' => (int) ($row->correct ?? 0),
            'marks_awarded' => (float) ($row->marks_awarded ?? 0),
            'marks_available' => (float) ($row->marks_available ?? 0),
            'last_attempted_at' => $row->last_attempted_at ?? null,
        ];
    }

    /**
     * @param  array<int>  $topicIds
     * @return array{mastery_score: float, confidence: float, topics_covered: int, total_topics: int}
     */
    private function aggregateMastery(int $userId, array $topicIds): array
    {
        if (empty($topicIds)) {
            return ['mastery_score' => 0.5, 'confidence' => 0.0, 'topics_covered' => 0, 'total_topics' => 0];
        }

        $rows = DB::table('topic_mastery')
            ->where('user_id', $userId)
            ->whereIn('topic_id', $topicIds)
            ->get();

        $covered = $rows->count();

        if ($covered === 0) {
            return ['mastery_score' => 0.5, 'confidence' => 0.0, 'topics_covered' => 0, 'total_topics' => count($topicIds)];
        }

        $avgMastery = round((float) $rows->avg('mastery_score'), 3);
        $avgConfidence = round((float) $rows->avg('confidence'), 3);

        return [
            'mastery_score' => $avgMastery,
            'confidence' => $avgConfidence,
            'topics_covered' => $covered,
            'total_topics' => count($topicIds),
        ];
    }
}
