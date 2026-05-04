<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum DiscountType: string
{
    case Percent = 'percent';
    case Fixed = 'fixed';
}
