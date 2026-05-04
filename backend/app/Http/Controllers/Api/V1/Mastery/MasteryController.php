<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Mastery;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use App\Models\User;
use App\Services\MasteryService;
use App\Services\UserContextResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasteryController extends Controller
{
    public function __construct(
        private readonly MasteryService $masteryService,
        private readonly UserContextResolver $contextResolver,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        $ctx = $this->contextResolver->resolve($user->id);

        $byExam = [];
        foreach ($ctx->examBodyIds as $examBodyId) {
            $byExam[$examBodyId] = $this->masteryService->computeForUserExam($ctx->userId, $examBodyId);
        }

        $bySubject = [];
        foreach ($ctx->subjectIds as $subjectId) {
            $bySubject[$subjectId] = $this->masteryService->computeForUserSubject($ctx->userId, $subjectId);
        }

        return response()->json([
            'data' => [
                'by_exam' => $byExam,
                'by_subject' => $bySubject,
            ],
        ]);
    }

    public function topic(Request $request, Topic $topic): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        $ctx = $this->contextResolver->resolve($user->id);

        if (! in_array($topic->id, $ctx->topicIds, true)) {
            abort(403, 'Topic is outside your enrolled subjects.');
        }

        $this->masteryService->computeForTopic($ctx->userId, $topic->id);

        $mastery = DB::table('topic_mastery')
            ->where('user_id', $ctx->userId)
            ->where('topic_id', $topic->id)
            ->first();

        return response()->json([
            'data' => [
                'topic_id' => $topic->id,
                'topic_name' => $topic->name,
                'mastery_score' => $mastery !== null ? (float) $mastery->mastery_score : 0.5,
                'confidence' => $mastery !== null ? (float) $mastery->confidence : 0.0,
                'attempts_count' => $mastery !== null ? (int) $mastery->attempts_count : 0,
                'correct_count' => $mastery !== null ? (int) $mastery->correct_count : 0,
                'last_attempted_at' => $mastery !== null ? $mastery->last_attempted_at : null,
            ],
        ]);
    }
}
