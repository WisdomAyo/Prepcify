<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum OtpStatus: string
{
    case Pending = 'pending';
    case Verified = 'verified';
    case Expired = 'expired';
}
