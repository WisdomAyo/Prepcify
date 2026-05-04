<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum ReportReason: string
{
    case IncorrectAnswer = 'incorrect_answer';
    case TypoOrGrammar = 'typo_or_grammar';
    case OutdatedContent = 'outdated_content';
    case DiagramIssue = 'diagram_issue';
    case Other = 'other';
}
