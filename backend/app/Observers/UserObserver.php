<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    public function deleted(User $user): void
    {
        // Cascade delete to profiles when user is soft-deleted
        $user->studentProfile?->delete();
        $user->parentProfile?->delete();
    }

    public function restored(User $user): void
    {
        // Profiles use regular deletes (no SoftDeletes), so nothing to restore here
    }
}
