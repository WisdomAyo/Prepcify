<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\TutorSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TutorSession> */
class TutorSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'started_at' => now(),
            'ended_at' => null,
            'last_message_at' => null,
            'message_count' => 0,
        ];
    }
}
