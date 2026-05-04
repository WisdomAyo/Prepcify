<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum AttemptContext: string
{
    case Drill = 'drill';
    case MockExam = 'mock_exam';
    case AiTutorChallenge = 'ai_tutor_challenge';
    case Diagnostic = 'diagnostic';
    case Duel = 'duel';
    case LiveBattle = 'live_battle';
}
