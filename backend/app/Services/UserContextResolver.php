<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExamSubject;
use App\Models\Topic;
use App\Models\User;
use App\Support\ValueObjects\UserContext;
use Illuminate\Support\Facades\Cache;

class UserContextResolver
{
    private const TTL_SECONDS = 3600;

    public function __construct(private readonly EntitlementService $entitlementService) {}

    public function resolve(int $userId): UserContext
    {
        $key = $this->cacheKey($userId);

        /** @var UserContext|null $cached */
        $cached = Cache::get($key);

        if ($cached instanceof UserContext) {
            return $cached;
        }

        $context = $this->build($userId);
        Cache::put($key, $context, self::TTL_SECONDS);

        return $context;
    }

    public function forget(int $userId): void
    {
        Cache::forget($this->cacheKey($userId));
    }

    private function cacheKey(int $userId): string
    {
        return "user_context:{$userId}";
    }

    private function build(int $userId): UserContext
    {
        $user = User::with([
            'examTargets',
            'userSubjects',
            'studentProfile',
        ])->findOrFail($userId);

        $examBodyIds = $user->examTargets
            ->pluck('exam_body_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $nearestTarget = $user->examTargets
            ->sortBy('target_date')
            ->first();

        $nearestExamDate = $nearestTarget?->target_date;

        $activeSubjects = $user->userSubjects->where('active', true);

        $subjectIds = $activeSubjects
            ->pluck('subject_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $examSubjectIds = ExamSubject::whereIn('exam_body_id', $examBodyIds)
            ->whereIn('subject_id', $subjectIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $topicIds = Topic::whereIn('exam_subject_id', $examSubjectIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $profile = $user->studentProfile;
        $dailyMinutes = $profile !== null ? (int) ($profile->daily_goal_minutes ?? 30) : 30;

        $permissions = $user->getAllPermissions()
            ->pluck('name')
            ->values()
            ->all();

        $entitlements = $this->entitlementService->forUser($userId);

        return new UserContext(
            userId: $userId,
            examBodyIds: $examBodyIds,
            examSubjectIds: $examSubjectIds,
            subjectIds: $subjectIds,
            topicIds: $topicIds,
            nearestExamDate: $nearestExamDate,
            dailyMinutes: $dailyMinutes,
            timezone: $user->timezone,
            locale: $user->locale,
            userType: $user->user_type,
            permissions: $permissions,
            entitlements: $entitlements,
        );
    }
}
