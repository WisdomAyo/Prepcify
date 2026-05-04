<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Support\Enums\AiFeature;
use App\Support\ValueObjects\UserContext;
use Generator;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\Factory as ViewFactory;

class ExplanationService
{
    private const CACHE_PREFIX = 'explanation:';

    public function __construct(
        private readonly AIRouter $router,
        private readonly ViewFactory $view,
    ) {}

    /**
     * Returns cached explanation text, or generates and caches it.
     * Cache is permanent until the Question model is edited (observer-invalidated).
     *
     * @return Generator<int, string, mixed, void>
     */
    public function getOrGenerate(Question $question, UserContext $ctx): Generator
    {
        $cacheKey = self::CACHE_PREFIX.$question->id;

        if (Cache::has($cacheKey)) {
            $cached = (string) Cache::get($cacheKey);
            yield $cached;

            return;
        }

        $systemPrompt = $this->view->make('prompts.explanation', [
            'examBody' => null,
            'subjectName' => null,
            'topicName' => null,
            'year' => $question->year,
        ])->render();

        $userMessage = "Explain the following question:\n\n".$question->stem;

        $fullText = '';

        foreach ($this->router->completeStream(AiFeature::Explanation, $systemPrompt, $userMessage, $ctx->userId) as $chunk) {
            $fullText .= $chunk;
            yield $chunk;
        }

        Cache::forever($cacheKey, $fullText);
    }

    public static function invalidate(int $questionId): void
    {
        Cache::forget(self::CACHE_PREFIX.$questionId);
    }
}
