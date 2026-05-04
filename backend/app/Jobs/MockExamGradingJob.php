<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Grades theory portions of a mock exam using AI grading.
 * Stub in MVP — MCQ grading is synchronous in MockExamService::submit().
 */
class MockExamGradingJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $mockExamId,
    ) {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        // AI grading implementation deferred to Milestone 6.
        // Theory portions remain ungraded until this job is implemented.
        logger()->info("MockExamGradingJob: mock_exam_id={$this->mockExamId} — stub, no-op in MVP.");
    }
}
