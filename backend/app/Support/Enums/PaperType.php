<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum PaperType: string
{
    case Objective = 'objective';
    case Theory = 'theory';
    case Practical = 'practical';
    case AlternativeToPractical = 'alternative_to_practical';
    case Listening = 'listening';
    case Speaking = 'speaking';
    case Writing = 'writing';
    case CaseStudy = 'case_study';

    public function label(): string
    {
        return match ($this) {
            self::Objective => 'Objective',
            self::Theory => 'Theory',
            self::Practical => 'Practical',
            self::AlternativeToPractical => 'Alternative to Practical',
            self::Listening => 'Listening',
            self::Speaking => 'Speaking',
            self::Writing => 'Writing',
            self::CaseStudy => 'Case Study',
        };
    }
}
