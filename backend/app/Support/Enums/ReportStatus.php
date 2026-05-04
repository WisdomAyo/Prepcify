<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum ReportStatus: string
{
    case Open = 'open';
    case Resolved = 'resolved';
    case Confirmed = 'confirmed';
    case Dismissed = 'dismissed';
}
