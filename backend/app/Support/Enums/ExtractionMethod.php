<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum ExtractionMethod: string
{
    case VisionOnly = 'vision_only';
    case MathpixThenText = 'mathpix_then_text';
}
