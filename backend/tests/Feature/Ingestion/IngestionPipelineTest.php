<?php

declare(strict_types=1);

use App\Jobs\ExtractPageQuestionsJob;
use App\Jobs\FinalizeIngestionJob;
use App\Jobs\SplitPdfJob;
use App\Models\ExamBody;
use App\Models\ExamPaper;
use App\Models\ExamSubject;
use App\Models\IngestionJob;
use App\Models\IngestionPage;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use App\Services\DraftCreationService;
use App\Services\IngestionUploadService;
use App\Services\PdfSplitterService;
use App\Services\VisionExtractionService;
use App\Support\DataTransferObjects\ExtractedQuestionDto;
use App\Support\Enums\ExtractionMethod;
use App\Support\Enums\IngestionStatus;
use App\Support\Enums\PageStatus;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

function makeAdminAndPaper(): array
{
    $examBody = ExamBody::factory()->create(['name' => 'WAEC', 'code' => 'waec']);
    $subject = Subject::factory()->create(['name' => 'Biology']);
    ExamSubject::factory()->create(['exam_body_id' => $examBody->id, 'subject_id' => $subject->id]);
    $paper = ExamPaper::factory()->create(['exam_body_id' => $examBody->id, 'subject_id' => $subject->id]);
    $admin = User::factory()->create();

    return [$admin, $paper];
}

// ─── IngestionUploadService ───────────────────────────────────────────────────

describe('IngestionUploadService', function () {
    it('creates an ingestion job stub and returns upload url', function () {
        Storage::fake('r2');
        [$admin, $paper] = makeAdminAndPaper();

        $service = app(IngestionUploadService::class);
        $result = $service->createUploadUrl($paper, $admin, 'gemini');

        expect($result)->toHaveKeys(['upload_url', 'job_id', 'r2_key']);
        expect($result['r2_key'])->toStartWith('ingestion/uploads/');

        $job = IngestionJob::find($result['job_id']);
        expect($job)->not->toBeNull();
        expect($job->status)->toBe(IngestionStatus::Queued);
        expect($job->exam_paper_id)->toBe($paper->id);
        expect($job->created_by)->toBe($admin->id);
    });

    it('confirms upload and dispatches SplitPdfJob', function () {
        Storage::fake('r2');
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $service = app(IngestionUploadService::class);
        $result = $service->createUploadUrl($paper, $admin);
        $service->confirmUpload($result['job_id'], $admin, 512000);

        Queue::assertPushedOn('ingestion', SplitPdfJob::class);
    });

    it('confirm upload is idempotent when job is not queued', function () {
        Storage::fake('r2');
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $service = app(IngestionUploadService::class);
        $result = $service->createUploadUrl($paper, $admin);
        $job = IngestionJob::find($result['job_id']);
        $job->update(['status' => IngestionStatus::Completed->value]);

        $service->confirmUpload($result['job_id'], $admin);

        Queue::assertNothingPushed();
    });

    it('enforces page cap and cancels job when admin lacks permission', function () {
        Permission::firstOrCreate(['name' => 'ingestion.large_jobs', 'guard_name' => 'web']);
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Splitting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
            'total_pages' => 100,
        ]);

        $service = app(IngestionUploadService::class);

        expect(fn () => $service->enforcePageCapForJob($job, $admin))
            ->toThrow(AccessDeniedHttpException::class);

        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::Cancelled);
    });

    it('does not block job under page cap limit', function () {
        Permission::firstOrCreate(['name' => 'ingestion.large_jobs', 'guard_name' => 'web']);
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Splitting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
            'total_pages' => 30,
        ]);

        $service = app(IngestionUploadService::class);
        $service->enforcePageCapForJob($job, $admin);

        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::Splitting);
    });

    it('enforces daily cost cap', function () {
        Storage::fake('r2');
        Queue::fake();
        config(['features.ai_ingestion_daily_cap_usd' => 1.00]);

        [$admin, $paper] = makeAdminAndPaper();
        IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'old.pdf',
            'status' => IngestionStatus::Completed->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
            'actual_cost_usd' => 1.50,
        ]);

        $service = app(IngestionUploadService::class);
        $result = $service->createUploadUrl($paper, $admin);

        expect(fn () => $service->confirmUpload($result['job_id'], $admin))
            ->toThrow(RuntimeException::class, 'Daily AI ingestion cost cap');
    });

    it('estimates cost correctly per provider', function () {
        $service = app(IngestionUploadService::class);

        expect($service->estimateCost(10, 'gemini'))->toBe(0.004);
        expect($service->estimateCost(10, 'openai'))->toBe(0.02);
        expect($service->estimateCost(10, 'claude'))->toBe(0.03);
        expect($service->estimateCost(10, 'unknown'))->toBe(0.004);
    });
});

// ─── SplitPdfJob ─────────────────────────────────────────────────────────────

describe('SplitPdfJob', function () {
    it('creates ingestion pages and dispatches extract jobs on success', function () {
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Queued->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        $splitter = Mockery::mock(PdfSplitterService::class);
        $splitter->allows('pageCount')->andReturn(2);
        $splitter->allows('split')->andReturn([
            ['page_number' => 1, 'r2_url' => 'ingestion/1/page-1.png'],
            ['page_number' => 2, 'r2_url' => 'ingestion/1/page-2.png'],
        ]);

        app()->instance(PdfSplitterService::class, $splitter);

        (new SplitPdfJob($job->id))->handle($splitter, app(IngestionUploadService::class));

        expect(IngestionPage::where('ingestion_job_id', $job->id)->count())->toBe(2);
        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::Extracting);
        expect($job->total_pages)->toBe(2);

        Queue::assertPushedOn('ingestion', ExtractPageQuestionsJob::class);
    });

    it('marks job as failed when splitter returns no pages', function () {
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Queued->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        $splitter = Mockery::mock(PdfSplitterService::class);
        $splitter->allows('pageCount')->andReturn(0);
        $splitter->allows('split')->andReturn([]);

        $queueJob = new SplitPdfJob($job->id);
        $queueJob->handle($splitter, app(IngestionUploadService::class));

        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::Failed);
    });

    it('is idempotent when job is already past splitting', function () {
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Completed->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        $splitter = Mockery::mock(PdfSplitterService::class);
        $splitter->shouldNotReceive('split');

        (new SplitPdfJob($job->id))->handle($splitter, app(IngestionUploadService::class));

        Queue::assertNothingPushed();
    });
});

// ─── ExtractPageQuestionsJob ──────────────────────────────────────────────────

describe('ExtractPageQuestionsJob', function () {
    it('extracts questions and dispatches finalize job', function () {
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Extracting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        $page = IngestionPage::create([
            'ingestion_job_id' => $job->id,
            'page_number' => 1,
            'page_image_url' => 'ingestion/1/page-1.png',
            'status' => PageStatus::Pending->value,
        ]);

        $dto = ExtractedQuestionDto::fromArray([
            'question_number' => '1',
            'question_format' => 'mcq',
            'stem' => 'What is H2O?',
            'options' => ['A' => 'Water', 'B' => 'Salt'],
            'correct_answer_label' => 'A',
            'has_diagram' => false,
            'has_sub_questions' => false,
            'topic_guess' => 'Chemistry',
            'confidence' => 0.99,
        ]);

        $extractor = Mockery::mock(VisionExtractionService::class);
        $extractor->allows('extractFromPage')->with($page->id)->andReturn([$dto]);

        (new ExtractPageQuestionsJob($job->id, 1))->handle($extractor, app(DraftCreationService::class));

        expect(Question::count())->toBe(1);
        Queue::assertPushedOn('ingestion', FinalizeIngestionJob::class);
    });

    it('is idempotent when page is already completed', function () {
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Extracting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        IngestionPage::create([
            'ingestion_job_id' => $job->id,
            'page_number' => 1,
            'page_image_url' => 'ingestion/1/page-1.png',
            'status' => PageStatus::Completed->value,
            'questions_extracted' => 3,
        ]);

        $extractor = Mockery::mock(VisionExtractionService::class);
        $extractor->shouldNotReceive('extractFromPage');

        (new ExtractPageQuestionsJob($job->id, 1))->handle($extractor, app(DraftCreationService::class));

        Queue::assertNothingPushed();
    });

    it('skips extraction when parent job is cancelled', function () {
        Queue::fake();
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Cancelled->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        IngestionPage::create([
            'ingestion_job_id' => $job->id,
            'page_number' => 1,
            'page_image_url' => 'ingestion/1/page-1.png',
            'status' => PageStatus::Pending->value,
        ]);

        $extractor = Mockery::mock(VisionExtractionService::class);
        $extractor->shouldNotReceive('extractFromPage');

        (new ExtractPageQuestionsJob($job->id, 1))->handle($extractor, app(DraftCreationService::class));

        Queue::assertNothingPushed();
    });
});

// ─── FinalizeIngestionJob ─────────────────────────────────────────────────────

describe('FinalizeIngestionJob', function () {
    it('marks job as completed when all pages succeed', function () {
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Extracting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        foreach ([1, 2] as $num) {
            IngestionPage::create([
                'ingestion_job_id' => $job->id,
                'page_number' => $num,
                'page_image_url' => "ingestion/1/page-{$num}.png",
                'status' => PageStatus::Completed->value,
                'questions_extracted' => 5,
                'cost_usd' => 0.0004,
            ]);
        }

        (new FinalizeIngestionJob($job->id))->handle();

        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::Completed);
        expect($job->questions_extracted)->toBe(10);
        expect($job->actual_cost_usd)->toBeGreaterThan(0);
        expect($job->completed_at)->not->toBeNull();
    });

    it('marks job as partially_failed when some pages failed', function () {
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Extracting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        IngestionPage::create(['ingestion_job_id' => $job->id, 'page_number' => 1, 'page_image_url' => 'p1.png', 'status' => PageStatus::Completed->value, 'questions_extracted' => 3]);
        IngestionPage::create(['ingestion_job_id' => $job->id, 'page_number' => 2, 'page_image_url' => 'p2.png', 'status' => PageStatus::Failed->value, 'error' => 'Timeout']);

        (new FinalizeIngestionJob($job->id))->handle();

        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::PartiallyFailed);
    });

    it('does nothing when pages are still processing', function () {
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Extracting->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
        ]);

        IngestionPage::create(['ingestion_job_id' => $job->id, 'page_number' => 1, 'page_image_url' => 'p1.png', 'status' => PageStatus::Completed->value]);
        IngestionPage::create(['ingestion_job_id' => $job->id, 'page_number' => 2, 'page_image_url' => 'p2.png', 'status' => PageStatus::Extracting->value]);

        (new FinalizeIngestionJob($job->id))->handle();

        $job->refresh();
        expect($job->status)->toBe(IngestionStatus::Extracting);
    });

    it('is idempotent when job is already completed', function () {
        [$admin, $paper] = makeAdminAndPaper();

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => 'test.pdf',
            'status' => IngestionStatus::Completed->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => 'gemini',
            'created_by' => $admin->id,
            'questions_extracted' => 42,
        ]);

        (new FinalizeIngestionJob($job->id))->handle();

        $job->refresh();
        expect($job->questions_extracted)->toBe(42);
    });
});
