<?php

declare(strict_types=1);

use App\Models\ExamBody;
use App\Models\ExamPaper;
use App\Models\IngestionJob;
use App\Models\IngestionPage;
use App\Models\Subject;
use App\Models\User;
use App\Services\AIRouter;
use App\Services\VisionExtractionService;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\AiFeature;
use App\Support\Enums\ExtractionMethod;
use App\Support\Enums\IngestionStatus;
use App\Support\Enums\PageStatus;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\Factory as ViewFactory;

function makePageWithJob(?int $adminId = null): IngestionPage
{
    $examBody = ExamBody::factory()->create(['name' => 'NECO', 'code' => 'neco']);
    $subject = Subject::factory()->create(['name' => 'Chemistry']);
    $paper = ExamPaper::factory()->create([
        'exam_body_id' => $examBody->id,
        'subject_id' => $subject->id,
        'year' => 2022,
    ]);
    $admin = $adminId ? User::find($adminId) : User::factory()->create();

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
        'page_number' => 2,
        'page_image_url' => 'ingestion/1/page-2.png',
        'status' => PageStatus::Pending->value,
    ]);
}

function makeVisionService(AIRouter $router): VisionExtractionService
{
    return new VisionExtractionService($router, app(ViewFactory::class));
}

function makeRouterMock(string $content = '[]'): AIRouter
{
    $response = new AIResponse(
        content: $content,
        model: 'gemini-1.5-pro',
        inputTokens: 500,
        outputTokens: 200,
        cost: 0.0004,
        provider: 'gemini',
        durationMs: 800,
    );

    $router = Mockery::mock(AIRouter::class);
    $router->allows('complete')
        ->with(AiFeature::QuestionExtraction, Mockery::any(), Mockery::any(), Mockery::any(), Mockery::any())
        ->andReturn($response);

    return $router;
}

it('marks page as extracting then completed on success', function () {
    Storage::fake('r2');
    $page = makePageWithJob();
    Storage::disk('r2')->put($page->page_image_url, 'fake-image-bytes');
    $json = json_encode([[
        'question_number' => '1',
        'question_format' => 'mcq',
        'stem' => 'What is water?',
        'options' => ['A' => 'H2O', 'B' => 'CO2'],
        'correct_answer_label' => 'A',
        'has_diagram' => false,
        'has_sub_questions' => false,
        'topic_guess' => 'Chemistry',
        'confidence' => 0.95,
    ]]);

    $service = makeVisionService(makeRouterMock($json));
    $dtos = $service->extractFromPage($page->id);

    expect($dtos)->toHaveCount(1);
    expect($dtos[0]->stem)->toBe('What is water?');

    $page->refresh();
    expect($page->status)->toBe(PageStatus::Completed);
    expect($page->questions_extracted)->toBe(1);
    expect($page->cost_usd)->toBe(0.0004);
    expect($page->ai_provider_used)->toBe('gemini');
});

it('returns empty array when ai returns non-json', function () {
    Storage::fake('r2');
    $page = makePageWithJob();
    Storage::disk('r2')->put($page->page_image_url, 'fake-image-bytes');
    $service = makeVisionService(makeRouterMock('This page contains only a diagram.'));

    $dtos = $service->extractFromPage($page->id);

    expect($dtos)->toBeEmpty();
    $page->refresh();
    expect($page->status)->toBe(PageStatus::Completed);
    expect($page->questions_extracted)->toBe(0);
});

it('strips markdown fences from ai response before parsing', function () {
    Storage::fake('r2');
    $page = makePageWithJob();
    Storage::disk('r2')->put($page->page_image_url, 'fake-image-bytes');
    $json = "```json\n[\n  {\"question_number\":\"1\",\"question_format\":\"theory\",\"stem\":\"Explain osmosis.\",\"options\":null,\"correct_answer_label\":null,\"has_diagram\":false,\"has_sub_questions\":false,\"topic_guess\":\"Transport\",\"confidence\":0.9}\n]\n```";

    $service = makeVisionService(makeRouterMock($json));
    $dtos = $service->extractFromPage($page->id);

    expect($dtos)->toHaveCount(1);
    expect($dtos[0]->stem)->toBe('Explain osmosis.');
});

it('marks page as failed and rethrows on router exception', function () {
    $page = makePageWithJob();

    Storage::fake('r2');
    Storage::disk('r2')->put($page->page_image_url, 'fake-image-bytes');

    $router = Mockery::mock(AIRouter::class);
    $router->allows('complete')->andThrow(new RuntimeException('AI provider timeout'));

    $service = makeVisionService($router);

    expect(fn () => $service->extractFromPage($page->id))
        ->toThrow(RuntimeException::class, 'Extraction failed');

    $page->refresh();
    expect($page->status)->toBe(PageStatus::Failed);
    expect($page->error)->toContain('AI provider timeout');
});

it('skips items without a stem field', function () {
    Storage::fake('r2');
    $page = makePageWithJob();
    Storage::disk('r2')->put($page->page_image_url, 'fake-image-bytes');
    $json = json_encode([
        ['question_number' => '1', 'question_format' => 'mcq', 'stem' => 'Valid question.', 'options' => null, 'correct_answer_label' => null, 'has_diagram' => false, 'has_sub_questions' => false, 'topic_guess' => null, 'confidence' => 0.8],
        ['question_number' => '2', 'question_format' => 'mcq', 'options' => null, 'correct_answer_label' => null, 'has_diagram' => false, 'has_sub_questions' => false, 'topic_guess' => null, 'confidence' => 0.5],
    ]);

    $service = makeVisionService(makeRouterMock($json));
    $dtos = $service->extractFromPage($page->id);

    expect($dtos)->toHaveCount(1);
});

it('records processing duration on page', function () {
    Storage::fake('r2');
    $page = makePageWithJob();
    Storage::disk('r2')->put($page->page_image_url, 'fake-image-bytes');
    $service = makeVisionService(makeRouterMock('[]'));

    $service->extractFromPage($page->id);

    $page->refresh();
    expect($page->processing_duration_ms)->toBeGreaterThanOrEqual(0);
});
