<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Session;

use App\Http\Controllers\Controller;
use App\Http\Requests\StartSessionRequest;
use App\Http\Resources\StudySessionResource;
use App\Models\StudySession;
use App\Models\User;
use App\Services\StudySessionService;
use App\Support\Enums\AttemptContext;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudySessionController extends Controller
{
    public function __construct(
        private readonly StudySessionService $sessionService,
    ) {}

    public function store(StartSessionRequest $request): StudySessionResource
    {
        $session = $this->sessionService->start(
            user: $request->user(),
            context: AttemptContext::from($request->validated('context')),
        );

        return new StudySessionResource($session);
    }

    public function end(Request $request, StudySession $studySession): StudySessionResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        $session = $this->sessionService->end($studySession, $user);

        return new StudySessionResource($session);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        $sessions = StudySession::where('user_id', $user->id)
            ->orderBy('started_at', 'desc')
            ->limit(20)
            ->get();

        return StudySessionResource::collection($sessions);
    }
}
