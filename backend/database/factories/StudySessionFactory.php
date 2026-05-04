<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\StudySession;
use App\Models\User;
use App\Support\Enums\AttemptContext;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<StudySession> */
class StudySessionFactory extends Factory
{
    public function definition(): array
    {
        $started = $this->faker->dateTimeBetween('-30 days', 'now');

        return [
            'user_id' => User::factory(),
            'started_at' => $started,
            'ended_at' => null,
            'questions_attempted' => 0,
            'questions_correct' => 0,
            'xp_earned' => 0,
            'context' => AttemptContext::Drill,
            'metadata' => null,
        ];
    }

    public function ended(): static
    {
        return $this->state(function (array $attrs) {
            $started = $attrs['started_at'] instanceof \DateTime
                ? $attrs['started_at']
                : new \DateTime($attrs['started_at']);

            return [
                'ended_at' => (clone $started)->modify('+30 minutes'),
                'questions_attempted' => rand(5, 30),
                'questions_correct' => rand(2, 15),
                'xp_earned' => rand(10, 150),
            ];
        });
    }
}
