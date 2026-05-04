<?php

declare(strict_types=1);

use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\Subject;
use App\Models\Topic;
use App\Support\Enums\ExamCategory;

// ─── GET /exams ──────────────────────────────────────────────────────────────

describe('GET /exams', function () {
    it('returns active exam bodies grouped by category', function () {
        ExamBody::factory()->create(['code' => 'jamb', 'name' => 'JAMB', 'category' => ExamCategory::SecondaryNg->value, 'status' => 'active', 'sort_order' => 1]);
        ExamBody::factory()->create(['code' => 'ielts', 'name' => 'IELTS', 'category' => ExamCategory::International->value, 'status' => 'active', 'sort_order' => 2]);
        ExamBody::factory()->create(['code' => 'hidden', 'name' => 'Hidden', 'category' => ExamCategory::SecondaryNg->value, 'status' => 'hidden', 'sort_order' => 3]);

        $response = $this->getJson('/api/v1/exams');

        $response->assertOk()
            ->assertJsonStructure(['data'])
            ->assertJsonPath('data.secondary_ng.0.code', 'jamb')
            ->assertJsonPath('data.international.0.code', 'ielts');

        // Hidden exam body must not appear
        $response->assertJsonMissing(['code' => 'hidden']);
    });

    it('filters by category query param', function () {
        ExamBody::factory()->create(['code' => 'jamb', 'name' => 'JAMB', 'category' => ExamCategory::SecondaryNg->value, 'status' => 'active', 'sort_order' => 1]);
        ExamBody::factory()->create(['code' => 'ielts', 'name' => 'IELTS', 'category' => ExamCategory::International->value, 'status' => 'active', 'sort_order' => 2]);

        $this->getJson('/api/v1/exams?category=secondary_ng')
            ->assertOk()
            ->assertJsonPath('data.secondary_ng.0.code', 'jamb')
            ->assertJsonMissing(['code' => 'ielts']);
    });

    it('snapshot — GET /exams returns expected structure', function () {
        ExamBody::factory()->create([
            'code' => 'jamb',
            'name' => 'JAMB (UTME)',
            'category' => ExamCategory::SecondaryNg->value,
            'status' => 'active',
            'sort_order' => 1,
        ]);

        $data = $this->getJson('/api/v1/exams')
            ->assertOk()
            ->json('data');

        expect($data)->toBeArray()
            ->and($data)->toHaveKey('secondary_ng')
            ->and($data['secondary_ng'][0])->toHaveKeys(['id', 'code', 'name', 'category', 'sort_order']);
    });
});

// ─── GET /exams/{code}/subjects ──────────────────────────────────────────────

describe('GET /exams/{code}/subjects', function () {
    it('returns subjects for an exam body', function () {
        $body = ExamBody::factory()->create(['code' => 'jamb', 'status' => 'active', 'category' => ExamCategory::SecondaryNg->value]);
        $subject = Subject::factory()->create(['name' => 'Physics', 'slug' => 'physics']);

        ExamSubject::factory()->create([
            'exam_body_id' => $body->id,
            'subject_id' => $subject->id,
            'is_compulsory' => false,
            'syllabus_version' => '2023',
            'syllabus_effective_from' => '2023-01-01',
        ]);

        $this->getJson('/api/v1/exams/jamb/subjects')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Physics');
    });

    it('returns 404 for unknown exam code', function () {
        $this->getJson('/api/v1/exams/unknown/subjects')->assertNotFound();
    });
});

// ─── GET /exams/{code}/subjects/{subjectId} ───────────────────────────────────

describe('GET /exams/{code}/subjects/{subjectId} (topic tree)', function () {
    it('returns topic tree for an exam subject', function () {
        $body = ExamBody::factory()->create(['code' => 'jamb', 'status' => 'active', 'category' => ExamCategory::SecondaryNg->value]);
        $subject = Subject::factory()->create(['name' => 'Physics', 'slug' => 'physics']);
        $examSubject = ExamSubject::factory()->create([
            'exam_body_id' => $body->id,
            'subject_id' => $subject->id,
            'syllabus_version' => '2023',
            'syllabus_effective_from' => '2023-01-01',
        ]);

        $root = Topic::factory()->create([
            'exam_subject_id' => $examSubject->id,
            'parent_topic_id' => null,
            'name' => 'Mechanics',
            'slug' => 'mechanics',
            'path' => 'mechanics',
            'depth' => 0,
        ]);

        Topic::factory()->create([
            'exam_subject_id' => $examSubject->id,
            'parent_topic_id' => $root->id,
            'name' => 'Kinematics',
            'slug' => 'kinematics',
            'path' => 'mechanics/kinematics',
            'depth' => 1,
        ]);

        $this->getJson("/api/v1/exams/jamb/subjects/{$subject->id}")
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Mechanics')
            ->assertJsonPath('data.0.children.0.name', 'Kinematics');
    });
});
