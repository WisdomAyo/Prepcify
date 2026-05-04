<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum ExamCategory: string
{
    case SecondaryNg = 'secondary_ng';
    case Professional = 'professional';
    case International = 'international';

    public function label(): string
    {
        return match ($this) {
            self::SecondaryNg => 'Secondary (Nigeria)',
            self::Professional => 'Professional',
            self::International => 'International',
        };
    }
}
