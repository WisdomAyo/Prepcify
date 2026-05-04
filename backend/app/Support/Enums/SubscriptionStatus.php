<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum SubscriptionStatus: string
{
    case Active = 'active';
    case PastDue = 'past_due';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
    case Trialing = 'trialing';
}
