<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Family;

use App\Http\Controllers\Controller;
use App\Http\Requests\EncouragementRequest;
use App\Http\Requests\InviteNewStudentRequest;
use App\Http\Requests\RequestLinkRequest;
use App\Http\Resources\ParentLinkResource;
use App\Http\Resources\StudentSummaryResource;
use App\Models\User;
use App\Services\FamilyService;
use App\Services\ParentViewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FamilyController extends Controller
{
    public function __construct(
        private readonly FamilyService $familyService,
        private readonly ParentViewService $parentViewService,
    ) {}

    public function inviteNewStudent(InviteNewStudentRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $invite = $this->familyService->inviteNewStudent($user, $request->validated());

        return response()->json([
            'token' => $invite->token,
            'expires_at' => $invite->expires_at,
        ], 201);
    }

    public function requestLink(RequestLinkRequest $request): ParentLinkResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $link = $this->familyService->requestLinkToExistingStudent(
            $user,
            (int) $request->validated('student_id'),
        );

        return new ParentLinkResource($link->load(['parent', 'student']));
    }

    public function children(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $summaries = $this->parentViewService->dashboardForParent($user);

        return StudentSummaryResource::collection($summaries);
    }

    public function childSummary(Request $request, int $studentId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $permission = (string) $request->query('permission', 'view_progress');
        $summary = $this->parentViewService->studentSummary($user, $studentId, $permission);

        return response()->json($summary);
    }

    public function sendEncouragement(EncouragementRequest $request, int $studentId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $this->parentViewService->sendEncouragement($user, $studentId, $request->validated('message'));

        return response()->json(['sent' => true]);
    }
}
