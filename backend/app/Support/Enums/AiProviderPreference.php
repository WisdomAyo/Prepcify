<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum AiProviderPreference: string
{
    case Gemini = 'gemini';
    case Claude = 'claude';
    case OpenAI = 'openai';
}
