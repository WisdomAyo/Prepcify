<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\IngestionJob;
use App\Models\IngestionPage;
use App\Services\DraftCreationService;
use App\Services\VisionExtractionService;
use App\Support\Enums\IngestionStatus;
use App\Support\Enums\PageStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExtractPageQuestionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(
        private readonly int $jobId,
        private readonly int $pageNumber,
    ) {}

    public function handle(VisionExtractionService $extractor, DraftCreationService $draftService): void
    {
        $job = IngestionJob::findOrFail($this->jobId);

        if (in_array($job->status, [IngestionStatus::Cancelled, IngestionStatus::Failed], true)) {
            Log::info("ExtractPageQuestionsJob: job {$this->jobId} is {$job->status->value}, skipping page {$this->pageNumber}.");

            return;
        }

        $page = IngestionPage::where('ingestion_job_id', $this->jobId)
            ->where('page_number', $this->pageNumber)
            ->firstOrFail();

        if (! in_array($page->status, [PageStatus::Pending, PageStatus::Extracting], true)) {
            Log::info("ExtractPageQuestionsJob: page {$page->id} already in status {$page->status->value}, skipping.");

            return;
        }

        $extracted = $extractor->extractFromPage($page->id);
        $count = $draftService->createDraftsFromExtraction($page->id, $extracted);

        Log::info("ExtractPageQuestionsJob: job {$this->jobId} page {$this->pageNumber} extracted {$count} questions.");

        FinalizeIngestionJob::dispatch($this->jobId)->onQueue('ingestion');
    }

    /** @return array<int, int> */
    public function backoff(): array
    {
        return [15, 45, 90];
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ExtractPageQuestionsJob: job {$this->jobId} page {$this->pageNumber} permanently failed: ".$exception->getMessage());

        IngestionPage::where('ingestion_job_id', $this->jobId)
            ->where('page_number', $this->pageNumber)
            ->update([
                'status' => PageStatus::Failed->value,
                'error' => 'Extraction failed after retries: '.$exception->getMessage(),
            ]);

        FinalizeIngestionJob::dispatch($this->jobId)->onQueue('ingestion');
    }
}
