<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Family;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClaimInviteRequest;
use App\Http\Requests\UpdateLinkPermissionsRequest;
use App\Http\Resources\ParentLinkResource;
use App\Models\ParentLink;
use App\Models\User;
use App\Services\FamilyService;
use App\Support\Enums\ParentLinkStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MeFamilyController extends Controller
{
    public function __construct(private readonly FamilyService $familyService) {}

    public function pendingLinks(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $links = ParentLink::where('student_user_id', $user->id)
            ->where('status', ParentLinkStatus::Pending->value)
            ->with(['parent', 'student'])
            ->get();

        return ParentLinkResource::collection($links);
    }

    public function acceptLink(Request $request, int $linkId): ParentLinkResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $link = $this->familyService->acceptLinkRequest($user, $linkId);

        return new ParentLinkResource($link->load(['parent', 'student']));
    }

    public function declineLink(Request $request, int $linkId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $this->familyService->declineLinkRequest($user, $linkId);

        return response()->json(['declined' => true]);
    }

    public function revokeLink(Request $request, int $linkId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $this->familyService->revokeLink($user, $linkId);

        return response()->json(['revoked' => true]);
    }

    public function updatePermissions(UpdateLinkPermissionsRequest $request, int $linkId): ParentLinkResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $link = $this->familyService->updatePermissions(
            $user,
            $linkId,
            (array) $request->validated('permissions'),
        );

        return new ParentLinkResource($link->load(['parent', 'student']));
    }

    public function claimInvite(ClaimInviteRequest $request): ParentLinkResource
    {
        /** @var User $user */
        $user = $request->user() ?? abort(401);

        $link = $this->familyService->claimStudentInvite($user, (string) $request->validated('token'));

        return new ParentLinkResource($link->load(['parent', 'student']));
    }
}
