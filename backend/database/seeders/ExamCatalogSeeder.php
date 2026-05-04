<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\Subject;
use App\Models\Topic;
use App\Support\Enums\ExamCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExamCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = $this->seedSubjects();
        $this->seedJamb($subjects);
        $this->seedWaec($subjects);
        $this->seedIcan();
        $this->seedIelts();
    }

    /** @return array<string, Subject> */
    private function seedSubjects(): array
    {
        $names = ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
        $subjects = [];

        foreach ($names as $name) {
            $subjects[$name] = Subject::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }

        return $subjects;
    }

    /** @param array<string, Subject> $subjects */
    private function seedJamb(array $subjects): void
    {
        $jamb = ExamBody::firstOrCreate(
            ['code' => 'jamb'],
            [
                'name' => 'JAMB (UTME)',
                'category' => ExamCategory::SecondaryNg->value,
                'description' => 'Joint Admissions and Matriculation Board — Unified Tertiary Matriculation Examination.',
                'status' => 'active',
                'sort_order' => 1,
            ],
        );

        $effectiveFrom = '2023-01-01';

        $examSubjects = [];
        foreach ($subjects as $name => $subject) {
            $examSubjects[$name] = ExamSubject::firstOrCreate(
                ['exam_body_id' => $jamb->id, 'subject_id' => $subject->id, 'syllabus_version' => '2023'],
                [
                    'is_compulsory' => $name === 'English Language',
                    'syllabus_effective_from' => $effectiveFrom,
                ],
            );
        }

        $this->seedJambPhysicsTopics($examSubjects['Physics']);
    }

    private function seedJambPhysicsTopics(ExamSubject $physicsEs): void
    {
        $chapters = [
            [
                'name' => 'Mechanics',
                'subtopics' => ['Kinematics', 'Dynamics', 'Energy & Work'],
            ],
            [
                'name' => 'Electricity & Magnetism',
                'subtopics' => ['Electric Fields', 'Current & Circuits'],
            ],
            [
                'name' => 'Waves & Optics',
                'subtopics' => ['Wave Properties', 'Light & Mirrors', 'Sound'],
            ],
        ];

        foreach ($chapters as $sort => $chapter) {
            $slug = Str::slug($chapter['name']);

            $root = Topic::firstOrCreate(
                ['exam_subject_id' => $physicsEs->id, 'slug' => $slug],
                [
                    'parent_topic_id' => null,
                    'name' => $chapter['name'],
                    'path' => $slug,
                    'depth' => 0,
                    'sort_order' => $sort,
                ],
            );

            foreach ($chapter['subtopics'] as $subSort => $subName) {
                $subSlug = Str::slug($subName);

                Topic::firstOrCreate(
                    ['exam_subject_id' => $physicsEs->id, 'slug' => $subSlug],
                    [
                        'parent_topic_id' => $root->id,
                        'name' => $subName,
                        'path' => "{$root->path}/{$subSlug}",
                        'depth' => 1,
                        'sort_order' => $subSort,
                    ],
                );
            }
        }
    }

    /** @param array<string, Subject> $subjects */
    private function seedWaec(array $subjects): void
    {
        $waec = ExamBody::firstOrCreate(
            ['code' => 'waec'],
            [
                'name' => 'WAEC (SSCE)',
                'category' => ExamCategory::SecondaryNg->value,
                'description' => 'West African Examinations Council — Senior School Certificate Examination.',
                'status' => 'active',
                'sort_order' => 2,
            ],
        );

        foreach ($subjects as $name => $subject) {
            ExamSubject::firstOrCreate(
                ['exam_body_id' => $waec->id, 'subject_id' => $subject->id, 'syllabus_version' => '2023'],
                [
                    'is_compulsory' => in_array($name, ['English Language', 'Mathematics'], true),
                    'syllabus_effective_from' => '2023-01-01',
                ],
            );
        }
    }

    private function seedIcan(): void
    {
        ExamBody::firstOrCreate(
            ['code' => 'ican'],
            [
                'name' => 'ICAN',
                'category' => ExamCategory::Professional->value,
                'description' => 'Institute of Chartered Accountants of Nigeria.',
                'status' => 'active',
                'sort_order' => 10,
            ],
        );
    }

    private function seedIelts(): void
    {
        ExamBody::firstOrCreate(
            ['code' => 'ielts'],
            [
                'name' => 'IELTS',
                'category' => ExamCategory::International->value,
                'description' => 'International English Language Testing System.',
                'status' => 'active',
                'sort_order' => 20,
            ],
        );
    }
}
