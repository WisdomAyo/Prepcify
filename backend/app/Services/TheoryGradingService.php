<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Attempt;
use App\Support\Enums\AiFeature;
use Illuminate\Support\Facades\Log;
use Illuminate\View\Factory as ViewFactory;

class TheoryGradingService
{
    public function __construct(
        private readonly AIRouter $router,
        private readonly ViewFactory $view,
    ) {}

    public function grade(Attempt $attempt): void
    {
        $question = $attempt->question;

        if ($question === null) {
            return;
        }

        $systemPrompt = 'You are an expert examiner. Always respond with valid JSON only.';
        $userPrompt = $this->view->make('prompts.theory-grading', [
            'questionStem' => $question->stem,
            'modelAnswer' => $question->explanation ?? 'No model answer provided.',
            'marksAvailable' => $attempt->marks_available ?? $question->marks ?? 10,
            'markingCriteria' => null,
            'studentResponse' => $attempt->response_text ?? '',
        ])->render();

        try {
            $response = $this->router->complete(
                AiFeature::Grading,
                $systemPrompt,
                $userPrompt,
                $attempt->user_id,
                ['max_tokens' => 1024],
            );

            $result = json_decode($response->content, true);

            if (! is_array($result)) {
                Log::warning('TheoryGradingService: non-JSON response for attempt '.$attempt->id);

                return;
            }

            $attempt->update([
                'marks_awarded' => $result['marks_awarded'] ?? null,
                'grading_breakdown' => $result,
                'graded_by' => 'ai',
                'graded_at' => now(),
                'is_correct' => isset($result['marks_awarded'], $result['max_marks'])
                    && $result['marks_awarded'] >= ($result['max_marks'] * 0.5),
            ]);
        } catch (\Throwable $e) {
            Log::error('TheoryGradingService failed for attempt '.$attempt->id.': '.$e->getMessage());
        }
    }
}
