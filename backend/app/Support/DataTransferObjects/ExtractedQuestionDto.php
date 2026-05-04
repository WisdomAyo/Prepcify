<?php

declare(strict_types=1);

namespace App\Support\DataTransferObjects;

readonly class ExtractedQuestionDto
{
    /** @param array<int, array{label: string, body: string}> $options */
    public function __construct(
        public string $questionNumber,
        public string $questionFormat,
        public string $stem,
        public array $options,
        public ?string $correctAnswerLabel,
        public bool $hasDiagram,
        public bool $hasSubQuestions,
        public ?string $topicGuess,
        public float $confidence,
    ) {}

    /** @param array<string, mixed> $data */
    public static function fromArray(array $data): self
    {
        return new self(
            questionNumber: (string) ($data['question_number'] ?? ''),
            questionFormat: (string) ($data['question_format'] ?? 'mcq'),
            stem: (string) ($data['stem'] ?? ''),
            options: (array) ($data['options'] ?? []),
            correctAnswerLabel: isset($data['correct_answer_label']) ? (string) $data['correct_answer_label'] : null,
            hasDiagram: (bool) ($data['has_diagram'] ?? false),
            hasSubQuestions: (bool) ($data['has_sub_questions'] ?? false),
            topicGuess: isset($data['topic_guess']) ? (string) $data['topic_guess'] : null,
            confidence: (float) ($data['confidence'] ?? 0.5),
        );
    }
}
