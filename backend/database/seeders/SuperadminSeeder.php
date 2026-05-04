<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Support\Enums\UserType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SEED_SUPERADMIN_EMAIL');
        $password = env('SEED_SUPERADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command->warn('Skipping SuperadminSeeder: SEED_SUPERADMIN_EMAIL or SEED_SUPERADMIN_PASSWORD not set.');

            return;
        }

        $user = User::withTrashed()->firstOrCreate(
            ['email' => $email],
            [
                'password' => Hash::make($password),
                'user_type' => UserType::Admin->value,
                'display_name' => 'Superadmin',
                'email_verified_at' => now(),
            ],
        );

        // Restore if soft-deleted
        if ($user->trashed()) {
            $user->restore();
        }

        $user->syncRoles(['Superadmin']);

        $this->command->info("Superadmin created/updated: {$email}");
    }
}
