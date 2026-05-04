<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum DraftStatus: string
{
    case Pending = 'pending';
    case UnderReview = 'under_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Escalated = 'escalated';
}
