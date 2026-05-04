<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum MockExamStatus: string
{
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Abandoned = 'abandoned';
}
