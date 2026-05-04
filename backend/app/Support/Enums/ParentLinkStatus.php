<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum ParentLinkStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Revoked = 'revoked';
}
