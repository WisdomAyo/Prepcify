<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum ParentLinkInvitedBy: string
{
    case Parent = 'parent';
    case Student = 'student';
    case System = 'system';
}
