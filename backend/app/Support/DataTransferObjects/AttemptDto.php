<?php

declare(strict_types=1);

namespace App\Support\DataTransferObjects;

use App\Support\Enums\AttemptContext;
use App\Support\Enums\AttemptType;
use Carbon\Carbon;

readonly class AttemptDto
{
    public function __construct(
        public int $questionId,
        public ?int $subQuestionId,
        public AttemptType $attemptType,
        public ?int $selectedOptionId,
        public ?string $responseText,
        public ?string $responseMediaUrl,
        public int $timeSpentMs,
        public AttemptContext $context,
        public string $clientUuid,
        public ?Carbon $attemptedAt = null,
    ) {}
}
