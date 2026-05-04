<?php

declare(strict_types=1);

use App\Models\ExamBody;
use App\Models\ExamPaper;
use App\Models\ExamSubject;
use App\Models\IngestionJob;
use App\Models\IngestionPage;
use App\Models\Question;
use App\Models\QuestionDraft;
use App\Models\Subject;
use App\Models\User;
use App\Services\DraftCreationService;
use App\Support\DataTransferObjects\ExtractedQuestionDto;
use App\Support\Enums\ExtractionMethod;
use App\Support\Enums\IngestionStatus;
use App\Support\Enums\PageStatus;
use App\Support\Enums\QuestionFormat;
use App\Support\Enums\QuestionStatus;

function makeIngestionPage(): IngestionPage
{
    $examBody = ExamBody::factory()->create(['name' => 'WAEC', 'code' => 'waec']);
    $subject = Subject::factory()->create(['name' => 'Biology']);
    ExamSubject::factory()->create(['exam_body_id' => $examBody->id, 'subject_id' => $subject->id]);
    $paper = ExamPaper::factory()->create(['exam_body_id' => $examBody->id, 'subject_id' => $subject->id, 'year' => 2023]);
    $admin = User::factory()->create();

    $job = IngestionJob::create([
        'exam_paper_id' => $paper->id,
        'pdf_url' => 'ingestion/uploads/1/test.pdf',
        'status' => IngestionStatus::Extracting->value,
        'extraction_method' => ExtractionMethod::VisionOnly->value,
        'ai_provider_preferred' => 'gemini',
        'created_by' => $admin->id,
    ]);

    return IngestionPage::create([
        'ingestion_job_id' => $job->id,
        'page_number' => 1,
        'page_image_url' => 'ingestion/1/page-1.png',
        'status' => PageStatus::Pending->value,
    ]);
}

function makeMcqDto(): ExtractedQuestionDto
{
    return ExtractedQuestionDto::fromArray([
        'question_number' => '1',
        'question_format' => 'mcq',
        'stem' => 'Which of the following is the basic unit of life?',
        'options' => ['A' => 'Atom', 'B' => 'Cell', 'C' => 'Tissue', 'D' => 'Organ'],
        'correct_answer_label' => null,
        'has_diagram' => false,
        'has_sub_questions' => false,
        'topic_guess' => 'Cell Biology',
        'confidence' => 0.98,
    ]);
}

it('returns 0 and does nothing for empty extracted array', function () {
    $page = makeIngestionPage();
    $count = app(DraftCreationService::class)->createDraftsFromExtraction($page->id, []);

    expect($count)->toBe(0);
    expect(Question::count())->toBe(0);
});

it('creates a question and draft for a valid mcq dto', function () {
    $page = makeIngestionPage();
    $count = app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [makeMcqDto()]);

    expect($count)->toBe(1);
    expect(Question::count())->toBe(1);
    expect(QuestionDraft::count())->toBe(1);

    $question = Question::first();
    expect($question->stem)->toBe('Which of the following is the basic unit of life?');
    expect($question->format)->toBe(QuestionFormat::Mcq);
    expect($question->status)->toBe(QuestionStatus::Draft);
});

it('populates draft with source page metadata', function () {
    $page = makeIngestionPage();
    app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [makeMcqDto()]);

    $draft = QuestionDraft::first();
    expect($draft->source_page_url)->toBe('ingestion/1/page-1.png');
    expect($draft->source_page_number)->toBe(1);
    expect($draft->extraction_confidence)->toBe(0.98);
    expect($draft->raw_extraction['question_number'])->toBe('1');
    expect($draft->raw_extraction['options'])->toHaveKey('A');
    expect($draft->raw_extraction['has_diagram'])->toBeFalse();
});

it('skips dtos with empty stem', function () {
    $page = makeIngestionPage();

    $emptyDto = ExtractedQuestionDto::fromArray([
        'question_number' => '2',
        'question_format' => 'mcq',
        'stem' => '',
        'options' => null,
        'correct_answer_label' => null,
        'has_diagram' => false,
        'has_sub_questions' => false,
        'topic_guess' => null,
        'confidence' => 0.1,
    ]);

    $count = app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [$emptyDto, makeMcqDto()]);

    expect($count)->toBe(1);
    expect(Question::count())->toBe(1);
});

it('resolves theory format correctly', function () {
    $page = makeIngestionPage();

    $dto = ExtractedQuestionDto::fromArray([
        'question_number' => '1',
        'question_format' => 'theory',
        'stem' => 'Explain photosynthesis.',
        'options' => null,
        'correct_answer_label' => null,
        'has_diagram' => false,
        'has_sub_questions' => false,
        'topic_guess' => 'Photosynthesis',
        'confidence' => 0.9,
    ]);

    app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [$dto]);

    expect(Question::first()->format)->toBe(QuestionFormat::Theory);
});

it('resolves structured format correctly', function () {
    $page = makeIngestionPage();

    $dto = ExtractedQuestionDto::fromArray([
        'question_number' => '2',
        'question_format' => 'structured',
        'stem' => '(a) Define osmosis. (b) State two differences.',
        'options' => null,
        'correct_answer_label' => null,
        'has_diagram' => false,
        'has_sub_questions' => true,
        'topic_guess' => 'Transport',
        'confidence' => 0.85,
    ]);

    app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [$dto]);

    expect(Question::first()->format)->toBe(QuestionFormat::Structured);
});

it('defaults unknown format to mcq', function () {
    $page = makeIngestionPage();

    $dto = ExtractedQuestionDto::fromArray([
        'question_number' => '3',
        'question_format' => 'unknown_type',
        'stem' => 'Some question.',
        'options' => null,
        'correct_answer_label' => null,
        'has_diagram' => false,
        'has_sub_questions' => false,
        'topic_guess' => null,
        'confidence' => 0.5,
    ]);

    app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [$dto]);

    expect(Question::first()->format)->toBe(QuestionFormat::Mcq);
});

it('creates multiple questions from multiple dtos', function () {
    $page = makeIngestionPage();
    $count = app(DraftCreationService::class)->createDraftsFromExtraction($page->id, [
        makeMcqDto(), makeMcqDto(), makeMcqDto(),
    ]);

    expect($count)->toBe(3);
    expect(Question::count())->toBe(3);
    expect(QuestionDraft::count())->toBe(3);
});
