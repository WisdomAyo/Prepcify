<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ParentLink;
use App\Models\User;
use App\Models\UserStreak;
use App\Models\UserXp;
use App\Support\Enums\ParentLinkStatus;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ParentViewService
{
    /** @return Collection<int, array<string, mixed>> */
    public function dashboardForParent(User $parent): Collection
    {
        /** @var Collection<int, array<string, mixed>> */
        return ParentLink::where('parent_user_id', $parent->id)
            ->where('status', ParentLinkStatus::Active->value)
            ->with(['student', 'student.streak', 'student.xp'])
            ->get()
            ->map(fn (ParentLink $link): array => $this->buildStudentSummary($link, ['view_progress']));
    }

    /** @return array<string, mixed> */
    public function studentSummary(User $parent, int $studentId, string $permission): array
    {
        $link = $this->getActiveLink($parent, $studentId);

        $permissions = $link->permissions ?? [];

        if (! ($permissions[$permission] ?? false)) {
            throw new AccessDeniedHttpException('Permission denied: '.$permission);
        }

        $link->update(['last_viewed_at' => now()]);

        return $this->buildStudentSummary($link, [$permission]);
    }

    public function sendEncouragement(User $parent, int $studentId, string $_message): void
    {
        $this->getActiveLink($parent, $studentId);
    }

    private function getActiveLink(User $parent, int $studentId): ParentLink
    {
        return ParentLink::where('parent_user_id', $parent->id)
            ->where('student_user_id', $studentId)
            ->where('status', ParentLinkStatus::Active->value)
            ->with(['student', 'student.streak', 'student.xp'])
            ->firstOrFail();
    }

    /**
     * @param  list<string>  $allowedPermissions
     * @return array<string, mixed>
     */
    private function buildStudentSummary(ParentLink $link, array $allowedPermissions): array
    {
        $student = $link->student;

        if (! $student instanceof User) {
            return [];
        }

        $permissions = $link->permissions ?? [];

        $summary = [
            'student_id' => $student->id,
            'display_name' => $student->display_name,
            'linked_at' => $link->linked_at,
            'permissions' => $permissions,
        ];

        if (in_array('view_progress', $allowedPermissions) && ($permissions['view_progress'] ?? false)) {
            $streak = $student->relationLoaded('streak') ? $student->streak : null;
            $xp = $student->relationLoaded('xp') ? $student->xp : null;

            $summary['streak'] = $streak instanceof UserStreak ? $streak->current_streak : 0;
            $summary['xp'] = $xp instanceof UserXp ? $xp->total_xp : 0;
        }

        return $summary;
    }
}
