<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TutorMessage;
use App\Models\TutorSession;
use App\Models\User;
use App\Support\Enums\AiFeature;
use App\Support\Enums\MessageRole;
use Generator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\Factory as ViewFactory;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class TutorService
{
    private const DAILY_USAGE_PREFIX = 'tutor:daily:';

    public function __construct(
        private readonly AIRouter $router,
        private readonly EntitlementService $entitlementService,
        private readonly ViewFactory $view,
    ) {}

    public function startSession(User $user): TutorSession
    {
        return TutorSession::create([
            'user_id' => $user->id,
            'started_at' => now(),
        ]);
    }

    public function listSessions(User $user): LengthAwarePaginator
    {
        return TutorSession::where('user_id', $user->id)
            ->latest('started_at')
            ->paginate(20);
    }

    /**
     * @return Collection<int, TutorMessage>
     */
    public function getMessages(TutorSession $session): Collection
    {
        return $session->messages()->get();
    }

    /**
     * Streams the assistant reply, enforcing daily message cap.
     *
     * @return Generator<int, string, mixed, void>
     */
    public function sendMessage(TutorSession $session, string $message): Generator
    {
        $this->enforceDailyCap($session->user_id);

        TutorMessage::create([
            'tutor_session_id' => $session->id,
            'role' => MessageRole::User->value,
            'content' => $message,
            'created_at' => now(),
        ]);

        $systemPrompt = $this->view->make('prompts.tutor-system', [
            'examBody' => null,
            'examTargets' => null,
            'level' => null,
            'sessionContext' => null,
            'performanceSummary' => null,
        ])->render();

        $fullResponse = '';

        foreach ($this->router->completeStream(AiFeature::Tutor, $systemPrompt, $message, $session->user_id) as $chunk) {
            $fullResponse .= $chunk;
            yield $chunk;
        }

        $outputTokens = (int) ceil(strlen($fullResponse) / 4);

        TutorMessage::create([
            'tutor_session_id' => $session->id,
            'role' => MessageRole::Assistant->value,
            'content' => $fullResponse,
            'tokens_used' => $outputTokens,
            'created_at' => now(),
        ]);

        $session->increment('message_count', 2);
        $session->update(['last_message_at' => now()]);

        $this->incrementDailyUsage($session->user_id);
    }

    private function enforceDailyCap(int $userId): void
    {
        $entitlements = $this->entitlementService->forUser($userId);
        $cap = (int) ($entitlements['ai_tutor_messages_per_day'] ?? 3);

        $used = (int) Cache::get($this->dailyKey($userId), 0);

        if ($used >= $cap) {
            throw new TooManyRequestsHttpException(null, 'Daily AI tutor message limit reached.');
        }
    }

    private function incrementDailyUsage(int $userId): void
    {
        $key = $this->dailyKey($userId);
        $ttl = (int) now()->endOfDay()->diffInSeconds(now());

        if (Cache::has($key)) {
            Cache::increment($key);
        } else {
            Cache::put($key, 1, $ttl);
        }
    }

    private function dailyKey(int $userId): string
    {
        return self::DAILY_USAGE_PREFIX.$userId.':'.now()->toDateString();
    }
}
