<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Success = 'success';
    case Failed = 'failed';
    case Reversed = 'reversed';
}
