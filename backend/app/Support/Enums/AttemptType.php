<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum AttemptType: string
{
    case Mcq = 'mcq';
    case ShortAnswer = 'short_answer';
    case Essay = 'essay';
    case CaseStudyPart = 'case_study_part';
    case Listening = 'listening';
    case Speaking = 'speaking';
    case Writing = 'writing';
}
