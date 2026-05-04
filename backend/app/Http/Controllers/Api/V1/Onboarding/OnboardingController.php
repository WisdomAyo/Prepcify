<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\SetExamTargetsRequest;
use App\Http\Requests\SetSubjectsRequest;
use App\Models\User;
use App\Services\OnboardingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OnboardingController extends Controller
{
    public function setExamTargets(SetExamTargetsRequest $request, OnboardingService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $service->setExamTargets(
            $user,
            $request->validated('exam_body_ids'),
            Carbon::parse($request->validated('target_date')),
        );

        return response()->json(['message' => 'Exam targets updated.']);
    }

    public function setSubjects(SetSubjectsRequest $request, OnboardingService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $service->setSubjects($user, $request->validated('selections'));

        return response()->json(['message' => 'Subjects updated.']);
    }

    public function complete(Request $request, OnboardingService $service): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $service->completeOnboarding($user);

        return response()->json(['message' => 'Onboarding complete.']);
    }
}
