<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamSubject> */
class ExamSubjectFactory extends Factory
{
    protected $model = ExamSubject::class;

    public function definition(): array
    {
        return [
            'exam_body_id' => ExamBody::factory(),
            'subject_id' => Subject::factory(),
            'is_compulsory' => false,
            'syllabus_version' => '2023',
            'syllabus_effective_from' => '2023-01-01',
            'syllabus_effective_to' => null,
        ];
    }
}
