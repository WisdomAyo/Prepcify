<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Question;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListQuestionsRequest;
use App\Http\Requests\ReportQuestionRequest;
use App\Http\Resources\QuestionListResource;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Repositories\QuestionRepository;
use App\Services\QuestionReportingService;
use App\Services\UserContextResolver;
use App\Support\Enums\ReportReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionRepository $repository,
        private readonly QuestionReportingService $reportingService,
        private readonly UserContextResolver $contextResolver,
    ) {}

    public function index(ListQuestionsRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $context = $this->contextResolver->resolve($user->id);

        $paginator = $this->repository->forUserContext($context, $request->validated());

        return QuestionListResource::collection($paginator);
    }

    public function show(Request $request, Question $question): QuestionResource
    {
        $question->load(['options', 'subQuestions.options', 'diagrams.labels', 'topics', 'tagRows']);

        return new QuestionResource($question);
    }

    public function report(ReportQuestionRequest $request, Question $question): JsonResponse
    {
        $validated = $request->validated();

        $this->reportingService->reportQuestion(
            question: $question,
            reporter: $request->user(),
            reason: ReportReason::from($validated['reason']),
            detail: $validated['detail'] ?? null,
        );

        return response()->json(['message' => 'Report submitted.'], 201);
    }

    public function similar(Request $request, Question $question): AnonymousResourceCollection
    {
        $questions = $this->repository->similarQuestions($question);

        return QuestionListResource::collection($questions);
    }
}
