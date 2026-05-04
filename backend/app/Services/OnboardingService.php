<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\StudentProfile;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use Carbon\Carbon;

class OnboardingService
{
    public function __construct(
        private readonly UserContextResolver $contextResolver,
    ) {}

    /**
     * Replace all exam targets for the user (idempotent).
     *
     * @param  int[]  $examBodyIds
     */
    public function setExamTargets(User $user, array $examBodyIds, Carbon $targetDate): void
    {
        UserExamTarget::where('user_id', $user->id)->delete();

        $now = now();
        $rows = array_map(fn (int $examBodyId) => [
            'user_id' => $user->id,
            'exam_body_id' => $examBodyId,
            'target_date' => $targetDate->toDateString(),
            'priority' => 1,
            'created_at' => $now,
        ], $examBodyIds);

        UserExamTarget::insert($rows);

        $this->contextResolver->forget($user->id);
    }

    /**
     * Upsert subject selections for the user (idempotent).
     * Each selection: ['exam_body_id' => int, 'subject_id' => int]
     *
     * @param  array<int, array{exam_body_id: int, subject_id: int}>  $selections
     */
    public function setSubjects(User $user, array $selections): void
    {
        $now = now();

        foreach ($selections as $selection) {
            UserSubject::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'exam_body_id' => $selection['exam_body_id'],
                    'subject_id' => $selection['subject_id'],
                ],
                [
                    'active' => true,
                    'deactivated_at' => null,
                    'created_at' => $now,
                ],
            );
        }

        $this->contextResolver->forget($user->id);
    }

    public function completeOnboarding(User $user): void
    {
        StudentProfile::updateOrCreate(
            ['user_id' => $user->id],
            ['onboarding_completed_at' => now()],
        );

        $this->contextResolver->forget($user->id);
    }
}
