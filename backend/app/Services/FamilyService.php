<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ParentLink;
use App\Models\StudentInviteToken;
use App\Models\User;
use App\Support\Enums\ParentLinkInvitedBy;
use App\Support\Enums\ParentLinkStatus;
use App\Support\Enums\UserType;
use Carbon\Carbon;
use Illuminate\Support\Str;

class FamilyService
{
    /** @param array<string, mixed> $data */
    public function inviteNewStudent(User $parent, array $data): StudentInviteToken
    {
        return StudentInviteToken::create([
            'created_by_parent_id' => $parent->id,
            'invited_name' => $data['name'],
            'invited_contact' => $data['contact'],
            'token' => Str::random(64),
            'claimed' => false,
            'claimed_by_user_id' => null,
            'expires_at' => Carbon::now()->addDays(7),
        ]);
    }

    public function claimStudentInvite(User $student, string $token): ParentLink
    {
        $invite = StudentInviteToken::where('token', $token)
            ->where('claimed', false)
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $invite->update([
            'claimed' => true,
            'claimed_by_user_id' => $student->id,
        ]);

        return ParentLink::create([
            'parent_user_id' => $invite->created_by_parent_id,
            'student_user_id' => $student->id,
            'status' => ParentLinkStatus::Active->value,
            'invited_by' => ParentLinkInvitedBy::Parent->value,
            'permissions' => $this->defaultPermissions(),
            'linked_at' => now(),
        ]);
    }

    public function requestLinkToExistingStudent(User $parent, int $studentId): ParentLink
    {
        $student = User::where('id', $studentId)
            ->where('user_type', UserType::Student->value)
            ->firstOrFail();

        $existing = ParentLink::where('parent_user_id', $parent->id)
            ->where('student_user_id', $student->id)
            ->whereIn('status', [ParentLinkStatus::Pending->value, ParentLinkStatus::Active->value])
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return ParentLink::create([
            'parent_user_id' => $parent->id,
            'student_user_id' => $student->id,
            'status' => ParentLinkStatus::Pending->value,
            'invited_by' => ParentLinkInvitedBy::Parent->value,
            'permissions' => $this->defaultPermissions(),
            'linked_at' => null,
        ]);
    }

    public function acceptLinkRequest(User $student, int $linkId): ParentLink
    {
        $link = ParentLink::where('id', $linkId)
            ->where('student_user_id', $student->id)
            ->where('status', ParentLinkStatus::Pending->value)
            ->firstOrFail();

        $link->update([
            'status' => ParentLinkStatus::Active->value,
            'linked_at' => now(),
        ]);

        return $link->refresh();
    }

    public function declineLinkRequest(User $student, int $linkId): void
    {
        $link = ParentLink::where('id', $linkId)
            ->where('student_user_id', $student->id)
            ->where('status', ParentLinkStatus::Pending->value)
            ->firstOrFail();

        $link->delete();
    }

    public function revokeLink(User $revoker, int $linkId): void
    {
        $link = ParentLink::where('id', $linkId)
            ->where(function ($q) use ($revoker) {
                $q->where('parent_user_id', $revoker->id)
                    ->orWhere('student_user_id', $revoker->id);
            })
            ->where('status', ParentLinkStatus::Active->value)
            ->firstOrFail();

        $link->update(['status' => ParentLinkStatus::Revoked->value]);
    }

    /** @param array<string, bool> $permissions */
    public function updatePermissions(User $parent, int $linkId, array $permissions): ParentLink
    {
        $link = ParentLink::where('id', $linkId)
            ->where('parent_user_id', $parent->id)
            ->where('status', ParentLinkStatus::Active->value)
            ->firstOrFail();

        $link->update(['permissions' => array_merge($this->defaultPermissions(), $permissions)]);

        return $link->refresh();
    }

    /** @return array<string, bool> */
    private function defaultPermissions(): array
    {
        return [
            'view_progress' => true,
            'view_attempts' => true,
            'receive_reports' => true,
        ];
    }
}
