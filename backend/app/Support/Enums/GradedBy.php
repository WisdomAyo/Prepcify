<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum GradedBy: string
{
    case System = 'system';
    case Ai = 'ai';
    case Human = 'human';
    case SelfReported = 'self_reported';
}
