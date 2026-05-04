<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\MockExamGradingJob;
use App\Models\ExamBody;
use App\Models\MockExam;
use App\Models\Question;
use App\Models\User;
use App\Support\Enums\AttemptContext;
use App\Support\Enums\MockExamStatus;
use App\Support\Enums\QuestionStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MockExamService
{
    /**
     * @param  array<int>  $subjectIds
     */
    public function start(User $user, int $examBodyId, array $subjectIds): MockExam
    {
        ExamBody::findOrFail($examBodyId);

        // Enforce one active mock per user per exam body
        MockExam::where('user_id', $user->id)
            ->where('exam_body_id', $examBodyId)
            ->where('status', MockExamStatus::InProgress->value)
            ->update(['status' => MockExamStatus::Abandoned->value]);

        return MockExam::create([
            'user_id' => $user->id,
            'exam_body_id' => $examBodyId,
            'subject_ids' => $subjectIds,
            'started_at' => now(),
            'status' => MockExamStatus::InProgress,
        ]);
    }

    public function getNextQuestion(MockExam $mock): ?Question
    {
        if ($mock->status !== MockExamStatus::InProgress) {
            return null;
        }

        $examSubjectIds = DB::table('exam_subjects')
            ->where('exam_body_id', $mock->exam_body_id)
            ->whereIn('subject_id', $mock->subject_ids)
            ->pluck('id')
            ->all();

        // Questions already attempted in this mock session
        $attemptedIds = DB::table('attempts')
            ->where('user_id', $mock->user_id)
            ->where('context', AttemptContext::MockExam->value)
            ->where('attempted_at', '>=', $mock->started_at->toDateTimeString())
            ->whereNotNull('question_id')
            ->pluck('question_id')
            ->all();

        return Question::whereIn('exam_subject_id', $examSubjectIds)
            ->where('status', QuestionStatus::Published->value)
            ->whereNotIn('id', $attemptedIds)
            ->orderBy('id')
            ->first();
    }

    public function submit(MockExam $mock): void
    {
        if ($mock->status !== MockExamStatus::InProgress) {
            throw ValidationException::withMessages(['mock_exam' => 'Mock exam is not in progress.']);
        }

        $attempts = DB::table('attempts')
            ->where('user_id', $mock->user_id)
            ->where('context', AttemptContext::MockExam->value)
            ->where('attempted_at', '>=', $mock->started_at->toDateTimeString())
            ->whereNotNull('question_id')
            ->get();

        $totalScore = (float) $attempts->sum('marks_awarded');
        $maxScore = (float) $attempts->sum('marks_available');

        $breakdown = $this->buildBreakdown($mock, $attempts);
        $percentile = $this->computePercentile($mock, $totalScore, $maxScore);

        $mock->update([
            'status' => MockExamStatus::Submitted,
            'submitted_at' => now(),
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'percentile' => $percentile,
            'breakdown' => $breakdown,
        ]);

        // Enqueue for theory grading (no-op stub in MVP)
        MockExamGradingJob::dispatch($mock->id);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    /**
     * @param  Collection<int, \stdClass>  $attempts
     * @return array<string, mixed>
     */
    private function buildBreakdown(MockExam $mock, Collection $attempts): array
    {
        $bySubject = [];

        foreach ($mock->subject_ids as $subjectId) {
            $examSubjectIds = DB::table('exam_subjects')
                ->where('exam_body_id', $mock->exam_body_id)
                ->where('subject_id', $subjectId)
                ->pluck('id')
                ->all();

            $questionIds = DB::table('questions')
                ->whereIn('exam_subject_id', $examSubjectIds)
                ->pluck('id')
                ->all();

            $subjectAttempts = $attempts->whereIn('question_id', $questionIds);

            $bySubject[$subjectId] = [
                'attempted' => $subjectAttempts->count(),
                'marks_awarded' => (float) $subjectAttempts->sum('marks_awarded'),
                'marks_available' => (float) $subjectAttempts->sum('marks_available'),
            ];
        }

        return ['by_subject' => $bySubject];
    }

    /**
     * Percentile based on completed mocks for the same exam body.
     * Returns null if fewer than 10 completed mocks exist.
     */
    private function computePercentile(MockExam $mock, float $totalScore, float $maxScore): ?float
    {
        if ($maxScore <= 0) {
            return null;
        }

        $pct = $totalScore / $maxScore;

        $completed = MockExam::where('exam_body_id', $mock->exam_body_id)
            ->where('status', MockExamStatus::Submitted->value)
            ->whereNotNull('total_score')
            ->whereNotNull('max_score')
            ->where('max_score', '>', 0)
            ->get(['total_score', 'max_score']);

        if ($completed->count() < 10) {
            return null;
        }

        $below = $completed->filter(fn ($m) => ((float) $m->total_score / (float) $m->max_score) < $pct)->count();

        return round(($below / $completed->count()) * 100, 2);
    }
}
