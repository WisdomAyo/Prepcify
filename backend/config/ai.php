<?php

declare(strict_types=1);
use App\Services\ClaudeService;
use App\Services\GeminiService;
use App\Services\OpenAIService;

return [

    'providers' => [
        'claude' => [
            'class' => ClaudeService::class,
            'api_key' => env('CLAUDE_API_KEY', env('ANTHROPIC_API_KEY')),
            'default_model' => env('CLAUDE_DEFAULT_MODEL', 'claude-sonnet-4-6'),
            'fallback_model' => env('CLAUDE_FALLBACK_MODEL', 'claude-haiku-4-5'),
            'daily_budget_usd' => (float) env('CLAUDE_DAILY_BUDGET_USD', 100),
            'enabled' => (bool) env('CLAUDE_ENABLED', true),
        ],
        'openai' => [
            'class' => OpenAIService::class,
            'api_key' => env('OPENAI_API_KEY'),
            'default_model' => env('OPENAI_DEFAULT_MODEL', 'gpt-4o'),
            'fallback_model' => env('OPENAI_FALLBACK_MODEL', 'gpt-4o-mini'),
            'daily_budget_usd' => (float) env('OPENAI_DAILY_BUDGET_USD', 50),
            'enabled' => (bool) env('OPENAI_ENABLED', true),
        ],
        'gemini' => [
            'class' => GeminiService::class,
            'api_key' => env('GEMINI_API_KEY'),
            'default_model' => env('GEMINI_DEFAULT_MODEL', 'gemini-2.5-pro'),
            'fallback_model' => env('GEMINI_FALLBACK_MODEL', 'gemini-2.0-flash'),
            'daily_budget_usd' => (float) env('GEMINI_DAILY_BUDGET_USD', 30),
            'enabled' => (bool) env('GEMINI_ENABLED', true),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature-to-Provider Routing
    |--------------------------------------------------------------------------
    | Ordered preference list per feature. The AIRouter tries providers in this
    | order, skipping any that are unhealthy, disabled, or over daily budget.
    | The 'question_extraction' feature prefers Gemini Flash (cheapest for
    | high-volume bulk work); user-facing features prefer Claude for quality.
    */
    'routes' => [
        'tutor' => ['claude', 'openai', 'gemini'],
        'explanation' => ['claude', 'openai', 'gemini'],
        'study_plan' => ['claude', 'openai', 'gemini'],
        'grading' => ['claude', 'openai'],
        'question_extraction' => ['gemini', 'openai', 'claude'],
        'embedding' => ['openai'],
    ],

];
