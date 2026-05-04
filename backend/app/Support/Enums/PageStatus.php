<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum PageStatus: string
{
    case Pending = 'pending';
    case Splitting = 'splitting';
    case Extracting = 'extracting';
    case Completed = 'completed';
    case Failed = 'failed';
    case Skipped = 'skipped';
}
