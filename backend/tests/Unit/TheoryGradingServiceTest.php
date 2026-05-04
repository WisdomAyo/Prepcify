<?php

declare(strict_types=1);

use App\Models\Attempt;
use App\Models\Question;
use App\Services\AIRouter;
use App\Services\TheoryGradingService;
use App\Support\DataTransferObjects\AIResponse;
use App\Support\Enums\AiFeature;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\View\Factory as ViewFactory;

function makeTheoryAiResponse(string $content): AIResponse
{
    return new AIResponse(
        content: $content,
        model: 'claude-sonnet-4-6',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.001,
        provider: 'claude',
        durationMs: 200,
    );
}

function mockViewFactory(): void
{
    $view = Mockery::mock(View::class);
    $view->allows('render')->andReturn('rendered grading prompt');

    $factory = Mockery::mock(ViewFactory::class);
    $factory->allows('make')->andReturn($view);

    app()->instance(ViewFactory::class, $factory);
    app()->instance(Factory::class, $factory);
}

it('grade updates attempt with marks awarded from AI JSON response', function () {
    mockViewFactory();

    $question = Question::factory()->create(['stem' => 'Explain gravity.', 'explanation' => 'A model answer.']);
    $attempt = Attempt::factory()->ungraded()->create([
        'question_id' => $question->id,
        'response_text' => 'Gravity pulls objects toward Earth.',
    ]);

    $mockRouter = Mockery::mock(AIRouter::class);
    $mockRouter->allows('complete')
        ->once()
        ->with(AiFeature::Grading, Mockery::any(), Mockery::any(), $attempt->user_id, Mockery::any())
        ->andReturn(makeTheoryAiResponse('{"marks_awarded": 7, "max_marks": 10, "feedback": "Good answer"}'));
    $this->app->instance(AIRouter::class, $mockRouter);

    app(TheoryGradingService::class)->grade($attempt->fresh());

    $this->assertDatabaseHas('attempts', [
        'id' => $attempt->id,
        'marks_awarded' => 7,
        'graded_by' => 'ai',
    ]);
});

it('grade sets is_correct true when marks >= 50% of max', function () {
    mockViewFactory();

    $question = Question::factory()->create();
    $attempt = Attempt::factory()->ungraded()->create(['question_id' => $question->id]);

    $mockRouter = Mockery::mock(AIRouter::class);
    $mockRouter->allows('complete')->andReturn(
        makeTheoryAiResponse('{"marks_awarded": 5, "max_marks": 10}'),
    );
    $this->app->instance(AIRouter::class, $mockRouter);

    app(TheoryGradingService::class)->grade($attempt->fresh());

    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'is_correct' => 1]);
});

it('grade sets is_correct false when marks < 50% of max', function () {
    mockViewFactory();

    $question = Question::factory()->create();
    $attempt = Attempt::factory()->ungraded()->create(['question_id' => $question->id]);

    $mockRouter = Mockery::mock(AIRouter::class);
    $mockRouter->allows('complete')->andReturn(
        makeTheoryAiResponse('{"marks_awarded": 4, "max_marks": 10}'),
    );
    $this->app->instance(AIRouter::class, $mockRouter);

    app(TheoryGradingService::class)->grade($attempt->fresh());

    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'is_correct' => 0]);
});

it('grade does nothing when attempt has no question', function () {
    $attempt = Attempt::factory()->create(['question_id' => null]);

    $mockRouter = Mockery::mock(AIRouter::class);
    $mockRouter->allows('complete')->never();
    $this->app->instance(AIRouter::class, $mockRouter);

    app(TheoryGradingService::class)->grade($attempt);

    // No exception thrown, no update
    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'graded_by' => 'system']);
});

it('grade handles non-JSON response gracefully without updating', function () {
    mockViewFactory();

    $question = Question::factory()->create();
    $attempt = Attempt::factory()->ungraded()->create(['question_id' => $question->id]);

    $mockRouter = Mockery::mock(AIRouter::class);
    $mockRouter->allows('complete')->andReturn(makeTheoryAiResponse('not valid json at all'));
    $this->app->instance(AIRouter::class, $mockRouter);

    app(TheoryGradingService::class)->grade($attempt->fresh());

    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'graded_by' => null]);
});

it('grade handles AIRouter exception without rethrowing', function () {
    mockViewFactory();

    $question = Question::factory()->create();
    $attempt = Attempt::factory()->ungraded()->create(['question_id' => $question->id]);

    $mockRouter = Mockery::mock(AIRouter::class);
    $mockRouter->allows('complete')->andThrow(new RuntimeException('All providers failed'));
    $this->app->instance(AIRouter::class, $mockRouter);

    // Should not throw
    app(TheoryGradingService::class)->grade($attempt->fresh());

    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'graded_by' => null]);
});
