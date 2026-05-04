<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExamSubject;
use App\Models\IngestionPage;
use App\Models\Question;
use App\Models\QuestionDraft;
use App\Support\DataTransferObjects\ExtractedQuestionDto;
use App\Support\Enums\DraftStatus;
use App\Support\Enums\QuestionFormat;
use App\Support\Enums\QuestionStatus;

class DraftCreationService
{
    /**
     * Create question_drafts from extracted DTOs.
     * Returns the count of drafts created.
     *
     * @param  array<int, ExtractedQuestionDto>  $extracted
     */
    public function createDraftsFromExtraction(int $pageId, array $extracted): int
    {
        if (empty($extracted)) {
            return 0;
        }

        $page = IngestionPage::with('ingestionJob.examPaper')->findOrFail($pageId);
        $job = $page->ingestionJob;
        $paper = $job?->examPaper;

        if ($job === null || $paper === null) {
            throw new \RuntimeException("Page {$pageId} has missing ingestion job or exam paper relationship.");
        }

        $examSubjectId = ExamSubject::where('exam_body_id', $paper->exam_body_id)
            ->where('subject_id', $paper->subject_id)
            ->value('id');

        $count = 0;

        foreach ($extracted as $dto) {
            if (empty($dto->stem)) {
                continue;
            }

            $format = $this->resolveFormat($dto->questionFormat);

            $question = Question::create([
                'exam_subject_id' => $examSubjectId,
                'stem' => $dto->stem,
                'format' => $format->value,
                'status' => QuestionStatus::Draft->value,
                'year' => $paper->year,
                'embedding' => null,
            ]);

            QuestionDraft::create([
                'question_id' => $question->id,
                'submitted_by' => $job->created_by,
                'assigned_reviewer_id' => null,
                'status' => DraftStatus::Pending->value,
                'reviewer_notes' => null,
                'submitted_at' => now(),
                'ingestion_job_id' => $job->id,
                'source_page_url' => $page->page_image_url,
                'source_page_number' => $page->page_number,
                'extraction_confidence' => $dto->confidence,
                'raw_extraction' => [
                    'question_number' => $dto->questionNumber,
                    'question_format' => $dto->questionFormat,
                    'options' => $dto->options,
                    'correct_answer_label' => $dto->correctAnswerLabel,
                    'has_diagram' => $dto->hasDiagram,
                    'has_sub_questions' => $dto->hasSubQuestions,
                    'topic_guess' => $dto->topicGuess,
                ],
            ]);

            $count++;
        }

        return $count;
    }

    private function resolveFormat(string $format): QuestionFormat
    {
        return match (strtolower($format)) {
            'theory' => QuestionFormat::Theory,
            'structured' => QuestionFormat::Structured,
            default => QuestionFormat::Mcq,
        };
    }
}
