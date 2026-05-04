<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum BillingInterval: string
{
    case Monthly = 'monthly';
    case Yearly = 'yearly';
}
