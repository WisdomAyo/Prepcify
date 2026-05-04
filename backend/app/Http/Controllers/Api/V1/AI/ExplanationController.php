<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\AI;

use App\Models\Question;
use App\Models\User;
use App\Services\ExplanationService;
use App\Services\UserContextResolver;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExplanationController
{
    public function __construct(
        private readonly ExplanationService $explanationService,
        private readonly UserContextResolver $contextResolver,
    ) {}

    public function __invoke(Request $request, int $questionId): StreamedResponse
    {
        if (! config('features.ai_explanations_enabled', true)) {
            abort(503, 'AI explanations are temporarily unavailable.');
        }

        $question = Question::published()->findOrFail($questionId);

        /** @var User $user */
        $user = $request->user();
        $ctx = $this->contextResolver->resolve($user->id);

        return response()->stream(function () use ($question, $ctx): void {
            foreach ($this->explanationService->getOrGenerate($question, $ctx) as $chunk) {
                echo 'data: '.json_encode(['text' => $chunk])."\n\n";
                ob_flush();
                flush();
            }
            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
