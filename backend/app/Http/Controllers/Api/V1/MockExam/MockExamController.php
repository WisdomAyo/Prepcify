<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\MockExam;

use App\Http\Controllers\Controller;
use App\Http\Requests\StartMockExamRequest;
use App\Http\Resources\MockExamResource;
use App\Http\Resources\QuestionResource;
use App\Models\MockExam;
use App\Models\User;
use App\Services\MockExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MockExamController extends Controller
{
    public function __construct(
        private readonly MockExamService $mockExamService,
    ) {}

    public function store(StartMockExamRequest $request): MockExamResource
    {
        $v = $request->validated();

        $mock = $this->mockExamService->start(
            user: $request->user(),
            examBodyId: (int) $v['exam_body_id'],
            subjectIds: array_map('intval', $v['subject_ids']),
        );

        return new MockExamResource($mock);
    }

    public function next(Request $request, MockExam $mockExam): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        if ($mockExam->user_id !== $user->id) {
            abort(403);
        }

        $question = $this->mockExamService->getNextQuestion($mockExam);

        if ($question === null) {
            return response()->json(['data' => null, 'message' => 'No more questions.']);
        }

        $question->load(['options', 'diagrams', 'subQuestions.options']);

        return response()->json(['data' => new QuestionResource($question)]);
    }

    public function submit(Request $request, MockExam $mockExam): MockExamResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);
        if ($mockExam->user_id !== $user->id) {
            abort(403);
        }

        $this->mockExamService->submit($mockExam);

        return new MockExamResource($mockExam->fresh());
    }
}
