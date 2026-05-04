<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\IngestionJob;
use App\Support\Enums\IngestionStatus;
use App\Support\Enums\PageStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FinalizeIngestionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(private readonly int $jobId) {}

    public function handle(): void
    {
        $job = IngestionJob::with('pages')->findOrFail($this->jobId);

        if (in_array($job->status, [IngestionStatus::Completed, IngestionStatus::Cancelled, IngestionStatus::Failed], true)) {
            return;
        }

        $pages = $job->pages;

        $total = $pages->count();
        $terminalStatuses = [PageStatus::Completed, PageStatus::Failed, PageStatus::Skipped];
        $done = $pages->filter(fn ($p) => in_array($p->status, $terminalStatuses, true))->count();

        if ($done < $total) {
            return;
        }

        $failed = $pages->filter(fn ($p) => $p->status === PageStatus::Failed)->count();
        $totalExtracted = $pages->sum(fn ($p) => $p->questions_extracted ?? 0);
        $totalCost = $pages->sum(fn ($p) => $p->cost_usd ?? 0.0);

        $newStatus = $failed > 0
            ? IngestionStatus::PartiallyFailed
            : IngestionStatus::Completed;

        $job->update([
            'status' => $newStatus->value,
            'completed_at' => now(),
            'questions_extracted' => $totalExtracted,
            'actual_cost_usd' => round($totalCost, 6),
        ]);

        Log::info("FinalizeIngestionJob: job {$this->jobId} finalized as {$newStatus->value}. Pages: {$total}, failed: {$failed}, questions: {$totalExtracted}.");
    }

    /** @return array<int, int> */
    public function backoff(): array
    {
        return [5, 15, 30];
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("FinalizeIngestionJob: job {$this->jobId} finalization permanently failed: ".$exception->getMessage());
    }
}
