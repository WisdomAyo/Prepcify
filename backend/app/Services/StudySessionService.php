<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Attempt;
use App\Models\StudySession;
use App\Models\User;
use App\Support\Enums\AttemptContext;
use Illuminate\Auth\Access\AuthorizationException;

class StudySessionService
{
    public function start(User $user, AttemptContext $context): StudySession
    {
        return StudySession::create([
            'user_id' => $user->id,
            'started_at' => now(),
            'context' => $context,
        ]);
    }

    public function end(StudySession $session, User $user): StudySession
    {
        if ($session->user_id !== $user->id) {
            throw new AuthorizationException('Session does not belong to this user.');
        }

        if ($session->ended_at !== null) {
            return $session;
        }

        $session->update(['ended_at' => now()]);
        $session->refresh();

        return $session;
    }

    /**
     * Links a batch of attempts to the session and updates running totals.
     *
     * @param  Attempt[]  $attempts
     */
    public function recordAttemptsInSession(StudySession $session, array $attempts): void
    {
        $correct = array_filter($attempts, fn (Attempt $a) => $a->is_correct === true);

        $session->increment('questions_attempted', count($attempts));
        $session->increment('questions_correct', count($correct));
    }
}
