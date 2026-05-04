<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamBody;
use App\Models\Subject;
use App\Models\User;
use App\Models\UserSubject;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<UserSubject> */
class UserSubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'exam_body_id' => ExamBody::factory(),
            'subject_id' => Subject::factory(),
            'active' => true,
            'deactivated_at' => null,
            'created_at' => now(),
        ];
    }
}
