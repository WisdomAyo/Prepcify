<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum QuestionStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
    case FlaggedForRegrade = 'flagged_for_regrade';
}
