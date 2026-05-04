<?php

declare(strict_types=1);

namespace App\Support\DataTransferObjects;

readonly class AIResponse
{
    public function __construct(
        public string $content,
        public string $model,
        public int $inputTokens,
        public int $outputTokens,
        public float $cost,
        public string $provider,
        public int $durationMs,
    ) {}
}
