<?php

declare(strict_types=1);

namespace App\Support\ValueObjects;

use App\Support\Enums\UserType;
use Carbon\Carbon;

readonly class UserContext
{
    /**
     * @param  int[]  $examBodyIds
     * @param  int[]  $examSubjectIds
     * @param  int[]  $subjectIds
     * @param  int[]  $topicIds  Derived from the user's active exam subjects
     * @param  string[]  $permissions
     * @param  array<string, mixed>  $entitlements
     */
    public function __construct(
        public int $userId,
        public array $examBodyIds,
        public array $examSubjectIds,
        public array $subjectIds,
        public array $topicIds,
        public ?Carbon $nearestExamDate,
        public int $dailyMinutes,
        public string $timezone,
        public string $locale,
        public UserType $userType,
        public array $permissions,
        public array $entitlements = [],
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'exam_body_ids' => $this->examBodyIds,
            'exam_subject_ids' => $this->examSubjectIds,
            'subject_ids' => $this->subjectIds,
            'topic_ids' => $this->topicIds,
            'nearest_exam_date' => $this->nearestExamDate?->toDateString(),
            'daily_minutes' => $this->dailyMinutes,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'user_type' => $this->userType->value,
            'permissions' => $this->permissions,
            'entitlements' => $this->entitlements,
        ];
    }
}
