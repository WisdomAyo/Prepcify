<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\AI;

use App\Http\Controllers\Controller;
use App\Models\TutorSession;
use App\Models\User;
use App\Services\TutorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TutorController extends Controller
{
    public function __construct(
        private readonly TutorService $tutorService,
    ) {}

    public function startSession(Request $request): JsonResponse
    {
        if (! config('features.ai_tutor_enabled', true)) {
            abort(503, 'AI tutor is temporarily unavailable.');
        }

        /** @var User $user */
        $user = $request->user();

        $session = $this->tutorService->startSession($user);

        return response()->json(['data' => [
            'id' => $session->id,
            'started_at' => $session->started_at->toIso8601String(),
            'message_count' => $session->message_count,
        ]], 201);
    }

    public function listSessions(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $paginator = $this->tutorService->listSessions($user);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function messages(Request $request, int $sessionId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $session = TutorSession::where('user_id', $user->id)->findOrFail($sessionId);
        $messages = $this->tutorService->getMessages($session);

        return response()->json(['data' => $messages->map(fn ($m) => [
            'id' => $m->id,
            'role' => $m->role->value,
            'content' => $m->content,
            'created_at' => $m->created_at->toIso8601String(),
        ])]);
    }

    public function sendMessage(Request $request, int $sessionId): StreamedResponse
    {
        if (! config('features.ai_tutor_enabled', true)) {
            abort(503, 'AI tutor is temporarily unavailable.');
        }

        $validated = $request->validate(['message' => ['required', 'string', 'max:2000']]);

        /** @var User $user */
        $user = $request->user();

        $session = TutorSession::where('user_id', $user->id)->findOrFail($sessionId);

        return response()->stream(function () use ($session, $validated): void {
            foreach ($this->tutorService->sendMessage($session, $validated['message']) as $chunk) {
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
