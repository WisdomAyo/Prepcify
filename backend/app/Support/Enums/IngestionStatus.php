<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum IngestionStatus: string
{
    case Queued = 'queued';
    case Splitting = 'splitting';
    case Extracting = 'extracting';
    case Completed = 'completed';
    case PartiallyFailed = 'partially_failed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
}
