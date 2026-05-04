<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Attempt;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordAttemptRequest;
use App\Http\Requests\RecordBatchAttemptsRequest;
use App\Http\Resources\AttemptResource;
use App\Services\AttemptService;
use App\Services\UserContextResolver;
use App\Support\DataTransferObjects\AttemptDto;
use App\Support\Enums\AttemptContext;
use App\Support\Enums\AttemptType;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AttemptController extends Controller
{
    public function __construct(
        private readonly AttemptService $attemptService,
        private readonly UserContextResolver $contextResolver,
    ) {}

    public function store(RecordAttemptRequest $request): AttemptResource
    {
        $v = $request->validated();
        $user = $request->user();
        $ctx = $this->contextResolver->resolve($user->id);

        $attempt = $this->attemptService->record($ctx, new AttemptDto(
            questionId: (int) $v['question_id'],
            subQuestionId: isset($v['sub_question_id']) ? (int) $v['sub_question_id'] : null,
            attemptType: AttemptType::from($v['attempt_type']),
            selectedOptionId: isset($v['selected_option_id']) ? (int) $v['selected_option_id'] : null,
            responseText: $v['response_text'] ?? null,
            responseMediaUrl: $v['response_media_url'] ?? null,
            timeSpentMs: (int) $v['time_spent_ms'],
            context: AttemptContext::from($v['context']),
            clientUuid: $v['client_uuid'],
            attemptedAt: isset($v['attempted_at']) ? Carbon::parse($v['attempted_at']) : null,
        ));

        return new AttemptResource($attempt);
    }

    public function storeBatch(RecordBatchAttemptsRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $ctx = $this->contextResolver->resolve($user->id);

        $dtos = array_map(fn (array $item) => new AttemptDto(
            questionId: (int) $item['question_id'],
            subQuestionId: isset($item['sub_question_id']) ? (int) $item['sub_question_id'] : null,
            attemptType: AttemptType::from($item['attempt_type']),
            selectedOptionId: isset($item['selected_option_id']) ? (int) $item['selected_option_id'] : null,
            responseText: $item['response_text'] ?? null,
            responseMediaUrl: $item['response_media_url'] ?? null,
            timeSpentMs: (int) $item['time_spent_ms'],
            context: AttemptContext::from($item['context']),
            clientUuid: $item['client_uuid'],
            attemptedAt: isset($item['attempted_at']) ? Carbon::parse($item['attempted_at']) : null,
        ), $request->validated('attempts'));

        $attempts = $this->attemptService->recordBatch($ctx, $dtos);

        return AttemptResource::collection($attempts);
    }
}
