<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExamBody;
use App\Models\IngestionPage;
use App\Models\Subject;
use App\Support\DataTransferObjects\ExtractedQuestionDto;
use App\Support\Enums\AiFeature;
use App\Support\Enums\PageStatus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\Factory as ViewFactory;
use RuntimeException;

class VisionExtractionService
{
    public function __construct(
        private readonly AIRouter $router,
        private readonly ViewFactory $view,
    ) {}

    /**
     * Use AI vision to extract questions from a page image.
     *
     * @return array<int, ExtractedQuestionDto>
     *
     * @throws RuntimeException on unrecoverable AI failure
     */
    public function extractFromPage(int $pageId): array
    {
        $page = IngestionPage::with('ingestionJob.examPaper.examBody', 'ingestionJob.examPaper.subject')->findOrFail($pageId);

        $job = $page->ingestionJob;
        $paper = $job?->examPaper;
        $examBody = $paper?->examBody;
        $subject = $paper?->subject;

        if ($job === null || $paper === null || $examBody === null || $subject === null) {
            throw new RuntimeException("Page {$pageId} has missing relationships (job/paper/examBody/subject).");
        }

        if (! ($examBody instanceof ExamBody) || ! ($subject instanceof Subject)) {
            throw new RuntimeException("Page {$pageId} has unexpected relationship types.");
        }

        $page->update(['status' => PageStatus::Extracting->value]);

        $startMs = (int) round(microtime(true) * 1000);

        try {
            $systemPrompt = $this->buildSystemPrompt($examBody, $subject);
            $imageUrl = Storage::disk('r2')->temporaryUrl($page->page_image_url, now()->addMinutes(10));
            $imageContents = Storage::disk('r2')->get($page->page_image_url);

            if ($imageContents === null) {
                throw new RuntimeException("Page image not found in R2: {$page->page_image_url}");
            }

            $providerHint = $job->ai_provider_preferred->value;

            $response = $this->router->complete(
                AiFeature::QuestionExtraction,
                $systemPrompt,
                'Extract all questions from the attached exam page image.',
                $job->created_by,
                [
                    'image_url' => $imageUrl,
                    'image_base64' => base64_encode($imageContents),
                    'image_mime_type' => 'image/png',
                    'preferred_provider' => $providerHint,
                ],
            );

            $durationMs = (int) round(microtime(true) * 1000) - $startMs;

            $parsed = $this->parseResponse($response->content);

            $page->update([
                'status' => PageStatus::Completed->value,
                'ai_provider_used' => $response->provider,
                'raw_response' => ['content' => $response->content, 'model' => $response->model],
                'questions_extracted' => count($parsed),
                'processing_duration_ms' => $durationMs,
                'cost_usd' => $response->cost,
            ]);

            return $parsed;
        } catch (\Throwable $e) {
            $durationMs = (int) round(microtime(true) * 1000) - $startMs;

            $page->update([
                'status' => PageStatus::Failed->value,
                'error' => $e->getMessage(),
                'processing_duration_ms' => $durationMs,
            ]);

            Log::error("VisionExtractionService: page {$pageId} failed: ".$e->getMessage());

            throw new RuntimeException('Extraction failed for page '.$pageId.': '.$e->getMessage(), previous: $e);
        }
    }

    /**
     * @return array<int, ExtractedQuestionDto>
     */
    private function parseResponse(string $content): array
    {
        $content = trim($content);

        // Strip markdown code fences if present
        if (str_starts_with($content, '```')) {
            $content = preg_replace('/^```(?:json)?\s*/m', '', $content) ?? $content;
            $content = preg_replace('/```\s*$/m', '', $content) ?? $content;
            $content = trim($content);
        }

        $decoded = json_decode($content, true);

        if (! is_array($decoded)) {
            Log::warning('VisionExtractionService: AI returned non-JSON: '.substr($content, 0, 200));

            return [];
        }

        $dtos = [];
        foreach ($decoded as $item) {
            if (! is_array($item) || empty($item['stem'])) {
                continue;
            }

            $dtos[] = ExtractedQuestionDto::fromArray($item);
        }

        return $dtos;
    }

    private function buildSystemPrompt(ExamBody $examBody, Subject $subject): string
    {
        return $this->view->make('prompts.extract-questions-from-page', [
            'examBody' => $examBody,
            'subject' => $subject,
        ])->render();
    }
}
