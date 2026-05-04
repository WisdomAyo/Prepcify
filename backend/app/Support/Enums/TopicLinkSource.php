<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum TopicLinkSource: string
{
    case Manual = 'manual';
    case Ai = 'ai';
    case Import = 'import';
}
