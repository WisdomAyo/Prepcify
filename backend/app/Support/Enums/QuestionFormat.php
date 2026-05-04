<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum QuestionFormat: string
{
    case Mcq = 'mcq';
    case Theory = 'theory';
    case Structured = 'structured';
}
