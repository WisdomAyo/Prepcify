<?php

declare(strict_types=1);

namespace App\Support\Enums;

enum AiFeature: string
{
    case Explanation = 'explanation';
    case Tutor = 'tutor';
    case Grading = 'grading';
    case StudyPlan = 'study_plan';
    case QuestionExtraction = 'question_extraction';
    case Embedding = 'embedding';
}
