<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\MasteryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class MasteryRecomputeJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 120;

    /**
     * @param  array<int>|null  $topicIds  Recompute only these topics; null means all affected topics.
     */
    public function __construct(
        public readonly int $userId,
        public readonly ?array $topicIds = null,
    ) {
        $this->onQueue('default');
    }

    public function handle(MasteryService $masteryService): void
    {
        if ($this->topicIds !== null) {
            foreach ($this->topicIds as $topicId) {
                $masteryService->computeForTopic($this->userId, $topicId);
            }

            return;
        }

        $masteryService->recomputeAllAffectedTopics($this->userId);
    }
}
