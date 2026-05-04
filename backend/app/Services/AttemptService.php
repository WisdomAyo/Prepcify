<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\MasteryRecomputeJob;
use App\Models\Attempt;
use App\Models\Question;
use App\Support\DataTransferObjects\AttemptDto;
use App\Support\Enums\AttemptType;
use App\Support\Enums\GradedBy;
use App\Support\ValueObjects\UserContext;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class AttemptService
{
    public function record(UserContext $ctx, AttemptDto $dto): Attempt
    {
        $question = Question::findOrFail($dto->questionId);

        if (! in_array($question->exam_subject_id, $ctx->examSubjectIds, true)) {
            throw new AuthorizationException('Question is outside your enrolled subjects.');
        }

        // Idempotency: return existing attempt if already submitted
        $existing = Attempt::where('client_uuid', $dto->clientUuid)
            ->where('user_id', $ctx->userId)
            ->first();

        if ($existing instanceof Attempt) {
            return $existing;
        }

        $graded = $this->grade($dto, $question);

        $attempt = Attempt::create([
            'user_id' => $ctx->userId,
            'question_id' => $dto->questionId,
            'sub_question_id' => $dto->subQuestionId,
            'attempt_type' => $dto->attemptType,
            'selected_option_id' => $dto->selectedOptionId,
            'response_text' => $dto->responseText,
            'response_media_url' => $dto->responseMediaUrl,
            'marks_available' => $graded['marks_available'],
            'marks_awarded' => $graded['marks_awarded'],
            'is_correct' => $graded['is_correct'],
            'graded_by' => $graded['graded_by'],
            'graded_at' => $graded['graded_at'],
            'time_spent_ms' => $dto->timeSpentMs,
            'context' => $dto->context,
            'client_uuid' => $dto->clientUuid,
            'attempted_at' => $dto->attemptedAt ?? now(),
        ]);

        $topicIds = DB::table('question_topics')
            ->where('question_id', $dto->questionId)
            ->pluck('topic_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        MasteryRecomputeJob::dispatch($ctx->userId, $topicIds ?: null);

        return $attempt;
    }

    /**
     * @param  AttemptDto[]  $dtos
     * @return Attempt[]
     */
    public function recordBatch(UserContext $ctx, array $dtos): array
    {
        $attempts = [];
        $affectedTopicIds = [];

        foreach ($dtos as $dto) {
            $question = Question::find($dto->questionId);
            if (! $question instanceof Question) {
                continue;
            }

            if (! in_array($question->exam_subject_id, $ctx->examSubjectIds, true)) {
                continue;
            }

            $existing = Attempt::where('client_uuid', $dto->clientUuid)
                ->where('user_id', $ctx->userId)
                ->first();

            if ($existing instanceof Attempt) {
                $attempts[] = $existing;

                continue;
            }

            $graded = $this->grade($dto, $question);

            $attempt = Attempt::create([
                'user_id' => $ctx->userId,
                'question_id' => $dto->questionId,
                'sub_question_id' => $dto->subQuestionId,
                'attempt_type' => $dto->attemptType,
                'selected_option_id' => $dto->selectedOptionId,
                'response_text' => $dto->responseText,
                'response_media_url' => $dto->responseMediaUrl,
                'marks_available' => $graded['marks_available'],
                'marks_awarded' => $graded['marks_awarded'],
                'is_correct' => $graded['is_correct'],
                'graded_by' => $graded['graded_by'],
                'graded_at' => $graded['graded_at'],
                'time_spent_ms' => $dto->timeSpentMs,
                'context' => $dto->context,
                'client_uuid' => $dto->clientUuid,
                'attempted_at' => $dto->attemptedAt ?? now(),
            ]);

            $attempts[] = $attempt;

            $topicIds = DB::table('question_topics')
                ->where('question_id', $dto->questionId)
                ->pluck('topic_id')
                ->map(fn ($id) => (int) $id)
                ->all();

            array_push($affectedTopicIds, ...$topicIds);
        }

        if (! empty($affectedTopicIds)) {
            MasteryRecomputeJob::dispatch($ctx->userId, array_unique($affectedTopicIds));
        }

        return $attempts;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    /** @return array{is_correct: bool|null, marks_awarded: float|null, marks_available: float, graded_by: GradedBy|null, graded_at: string|null} */
    private function grade(AttemptDto $dto, Question $question): array
    {
        $marksAvailable = (float) $question->marks;

        if ($dto->attemptType === AttemptType::Mcq) {
            $isCorrect = $question->correct_option_id !== null
                && $dto->selectedOptionId === $question->correct_option_id;

            return [
                'is_correct' => $isCorrect,
                'marks_awarded' => $isCorrect ? $marksAvailable : 0.0,
                'marks_available' => $marksAvailable,
                'graded_by' => GradedBy::System,
                'graded_at' => now()->toDateTimeString(),
            ];
        }

        return [
            'is_correct' => null,
            'marks_awarded' => null,
            'marks_available' => $marksAvailable,
            'graded_by' => null,
            'graded_at' => null,
        ];
    }
}
