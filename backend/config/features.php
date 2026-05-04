<?php

declare(strict_types=1);

return [
    'ai_tutor_enabled' => (bool) env('AI_TUTOR_ENABLED', true),
    'ai_explanations_enabled' => (bool) env('AI_EXPLANATIONS_ENABLED', true),
    'ai_study_plan_enabled' => (bool) env('AI_STUDY_PLAN_ENABLED', true),
    'ai_ingestion_daily_cap_usd' => (float) env('AI_INGESTION_DAILY_CAP_USD', 0),
];
