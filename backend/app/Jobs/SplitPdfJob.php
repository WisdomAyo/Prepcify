<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\IngestionJob;
use App\Models\IngestionPage;
use App\Services\IngestionUploadService;
use App\Services\PdfSplitterService;
use App\Support\Enums\IngestionStatus;
use App\Support\Enums\PageStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SplitPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(private readonly int $jobId) {}

    public function handle(PdfSplitterService $splitter, IngestionUploadService $uploadService): void
    {
        $job = IngestionJob::findOrFail($this->jobId);

        if (! in_array($job->status, [IngestionStatus::Queued, IngestionStatus::Splitting], true)) {
            Log::info("SplitPdfJob: job {$this->jobId} already past splitting stage ({$job->status->value}), skipping.");

            return;
        }

        $job->update(['status' => IngestionStatus::Splitting->value]);

        $totalPages = $splitter->pageCount($job->pdf_url, $job->id);
        $job->update(['total_pages' => $totalPages]);

        $admin = $job->creator;
        if ($admin !== null) {
            $uploadService->enforcePageCapForJob($job, $admin);
        }

        $pages = $splitter->split($job->pdf_url, $job->id);

        if (empty($pages)) {
            $job->update([
                'status' => IngestionStatus::Failed->value,
                'error_summary' => 'PDF splitting produced no pages.',
            ]);
            $this->fail(new \RuntimeException('PDF splitting produced no pages for job '.$this->jobId));

            return;
        }

        foreach ($pages as $pageData) {
            IngestionPage::updateOrCreate(
                ['ingestion_job_id' => $job->id, 'page_number' => $pageData['page_number']],
                [
                    'page_image_url' => $pageData['r2_url'],
                    'status' => PageStatus::Pending->value,
                    'error' => null,
                ],
            );
        }

        $job->update(['status' => IngestionStatus::Extracting->value]);

        foreach ($pages as $pageData) {
            ExtractPageQuestionsJob::dispatch($job->id, $pageData['page_number'])
                ->onQueue('ingestion');
        }
    }

    /** @return array<int, int> */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SplitPdfJob: job {$this->jobId} permanently failed: ".$exception->getMessage());

        IngestionJob::where('id', $this->jobId)->update([
            'status' => IngestionStatus::Failed->value,
            'error_summary' => 'Split failed after '.$this->tries.' attempts: '.$exception->getMessage(),
        ]);
    }
}
