<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\AI;

use App\Models\User;
use App\Services\StudyPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyPlanController
{
    public function __construct(
        private readonly StudyPlanService $studyPlanService,
    ) {}

    public function current(Request $request): JsonResponse
    {
        if (! config('features.ai_study_plan_enabled', true)) {
            abort(503, 'AI study plans are temporarily unavailable.');
        }

        /** @var User $user */
        $user = $request->user();

        $plan = $this->studyPlanService->current($user);

        if ($plan === null) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => [
            'id' => $plan->id,
            'content' => $plan->content,
            'generated_at' => $plan->generated_at->toIso8601String(),
            'expires_at' => $plan->expires_at->toIso8601String(),
        ]]);
    }

    public function regenerate(Request $request): JsonResponse
    {
        if (! config('features.ai_study_plan_enabled', true)) {
            abort(503, 'AI study plans are temporarily unavailable.');
        }

        /** @var User $user */
        $user = $request->user();

        $plan = $this->studyPlanService->forceRegenerate($user);

        return response()->json(['data' => [
            'id' => $plan->id,
            'content' => $plan->content,
            'generated_at' => $plan->generated_at->toIso8601String(),
            'expires_at' => $plan->expires_at->toIso8601String(),
        ]], 201);
    }
}
