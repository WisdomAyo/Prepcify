<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\SplitPdfJob;
use App\Models\ExamPaper;
use App\Models\IngestionJob;
use App\Models\User;
use App\Support\Enums\ExtractionMethod;
use App\Support\Enums\IngestionStatus;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class IngestionUploadService
{
    private const MAX_PAGES_WITHOUT_PERMISSION = 60;

    private const COST_PER_PAGE_USD = [
        'gemini' => 0.0004,
        'openai' => 0.002,
        'claude' => 0.003,
    ];

    /**
     * Returns a presigned R2 upload URL and creates an ingestion_job stub.
     * The upload_url value is the full array returned by temporaryUploadUrl (contains 'url' and 'headers').
     *
     * @return array{upload_url: array<string, mixed>, job_id: int, r2_key: string}
     */
    public function createUploadUrl(ExamPaper $paper, User $admin, string $provider = 'gemini'): array
    {
        $r2Key = 'ingestion/uploads/'.$paper->id.'/'.uniqid('pdf_', true).'.pdf';

        $uploadUrl = Storage::disk('r2')->temporaryUploadUrl(
            $r2Key,
            now()->addMinutes(30),
            ['ContentType' => 'application/pdf'],
        );

        $job = IngestionJob::create([
            'exam_paper_id' => $paper->id,
            'pdf_url' => $r2Key,
            'pdf_size_bytes' => 0,
            'status' => IngestionStatus::Queued->value,
            'extraction_method' => ExtractionMethod::VisionOnly->value,
            'ai_provider_preferred' => $provider,
            'created_by' => $admin->id,
        ]);

        return [
            'upload_url' => $uploadUrl,
            'job_id' => $job->id,
            'r2_key' => $r2Key,
        ];
    }

    /**
     * Called by the admin after direct R2 upload completes.
     * Validates page count, estimates cost, dispatches SplitPdfJob.
     */
    public function confirmUpload(int $jobId, User $admin, int $fileSizeBytes = 0): void
    {
        $job = IngestionJob::findOrFail($jobId);

        if ($job->status !== IngestionStatus::Queued) {
            return;
        }

        $job->update([
            'pdf_size_bytes' => $fileSizeBytes,
            'status' => IngestionStatus::Queued->value,
        ]);

        $this->checkDailyCapOrFail();

        SplitPdfJob::dispatch($job->id)->onQueue('ingestion');
    }

    /**
     * After the PDF is split and total_pages is known, enforce the large-job permission.
     */
    public function enforcePageCapForJob(IngestionJob $job, User $admin): void
    {
        if (
            $job->total_pages !== null
            && $job->total_pages > self::MAX_PAGES_WITHOUT_PERMISSION
            && ! $admin->hasPermissionTo('ingestion.large_jobs')
        ) {
            $job->update([
                'status' => IngestionStatus::Cancelled->value,
                'error_summary' => 'PDF exceeds '.self::MAX_PAGES_WITHOUT_PERMISSION.' pages and user lacks ingestion.large_jobs permission.',
            ]);

            throw new AccessDeniedHttpException('Large PDF ingestion requires the ingestion.large_jobs permission.');
        }
    }

    /**
     * Pre-calculate estimated cost based on page count × per-page rate.
     */
    public function estimateCost(int $pageCount, string $provider): float
    {
        $rate = self::COST_PER_PAGE_USD[$provider] ?? self::COST_PER_PAGE_USD['gemini'];

        return round($pageCount * $rate, 4);
    }

    private function checkDailyCapOrFail(): void
    {
        $cap = (float) config('features.ai_ingestion_daily_cap_usd', 0);

        if ($cap <= 0) {
            return;
        }

        $spentToday = IngestionJob::whereDate('created_at', today())
            ->whereNotIn('status', [IngestionStatus::Cancelled->value, IngestionStatus::Failed->value])
            ->sum('actual_cost_usd');

        if ((float) $spentToday >= $cap) {
            throw new RuntimeException('Daily AI ingestion cost cap of $'.number_format($cap, 2).' has been reached. Try again tomorrow.');
        }
    }
}
