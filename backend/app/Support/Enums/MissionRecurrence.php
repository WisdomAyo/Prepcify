<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum MissionRecurrence: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Once = 'once';
}
