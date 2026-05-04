<?php

declare(strict_types=1);

use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserExamTarget;
use App\Models\UserSubject;
use App\Services\UserContextResolver;
use App\Support\Enums\ExamCategory;
use App\Support\ValueObjects\UserContext;
use Illuminate\Support\Facades\Cache;

describe('UserContextResolver', function () {
    it('builds context from database on cache miss', function () {
        Cache::flush();

        $user = User::factory()->create(['timezone' => 'Africa/Lagos', 'locale' => 'en_NG']);
        $body = ExamBody::factory()->create(['code' => 'jamb', 'category' => ExamCategory::SecondaryNg->value]);
        $subject = Subject::factory()->create(['name' => 'Physics', 'slug' => 'physics']);

        $es = ExamSubject::factory()->create([
            'exam_body_id' => $body->id,
            'subject_id' => $subject->id,
            'syllabus_version' => '2023',
            'syllabus_effective_from' => '2023-01-01',
        ]);

        UserExamTarget::create([
            'user_id' => $user->id,
            'exam_body_id' => $body->id,
            'target_date' => now()->addYear()->toDateString(),
            'priority' => 1,
            'created_at' => now(),
        ]);

        UserSubject::create([
            'user_id' => $user->id,
            'exam_body_id' => $body->id,
            'subject_id' => $subject->id,
            'active' => true,
            'created_at' => now(),
        ]);

        Topic::factory()->create([
            'exam_subject_id' => $es->id,
            'parent_topic_id' => null,
            'name' => 'Mechanics',
            'slug' => 'mechanics',
            'path' => 'mechanics',
            'depth' => 0,
        ]);

        $resolver = app(UserContextResolver::class);
        $context = $resolver->resolve($user->id);

        expect($context)->toBeInstanceOf(UserContext::class)
            ->and($context->userId)->toBe($user->id)
            ->and($context->examBodyIds)->toContain($body->id)
            ->and($context->subjectIds)->toContain($subject->id)
            ->and($context->topicIds)->not->toBeEmpty()
            ->and($context->timezone)->toBe('Africa/Lagos');
    });

    it('returns cached context on subsequent calls', function () {
        Cache::flush();

        $user = User::factory()->create();
        $resolver = app(UserContextResolver::class);

        $first = $resolver->resolve($user->id);
        $second = $resolver->resolve($user->id);

        expect($first)->toBe($second);
        expect(Cache::has("user_context:{$user->id}"))->toBeTrue();
    });

    it('rebuilds context after forget()', function () {
        Cache::flush();

        $user = User::factory()->create();
        $resolver = app(UserContextResolver::class);

        $first = $resolver->resolve($user->id);
        $resolver->forget($user->id);

        expect(Cache::has("user_context:{$user->id}"))->toBeFalse();

        $second = $resolver->resolve($user->id);
        expect($first)->not->toBe($second);
    });
});
