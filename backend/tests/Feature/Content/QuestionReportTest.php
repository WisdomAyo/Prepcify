<?php

declare(strict_types=1);

use App\Models\Question;
use App\Models\QuestionReport;
use App\Models\User;
use App\Services\QuestionReportingService;
use App\Support\Enums\ReportReason;
use App\Support\Enums\ReportStatus;
use Illuminate\Validation\ValidationException;

// ─── reportQuestion ───────────────────────────────────────────────────────────

describe('QuestionReportingService::reportQuestion', function () {
    it('creates an open report', function () {
        $question = Question::factory()->create();
        $reporter = User::factory()->create();

        app(QuestionReportingService::class)->reportQuestion(
            question: $question,
            reporter: $reporter,
            reason: ReportReason::IncorrectAnswer,
        );

        $this->assertDatabaseHas('question_reports', [
            'question_id' => $question->id,
            'reported_by' => $reporter->id,
            'status' => ReportStatus::Open->value,
        ]);
    });

    it('prevents duplicate open reports from same user', function () {
        $question = Question::factory()->create();
        $reporter = User::factory()->create();

        $service = app(QuestionReportingService::class);
        $service->reportQuestion($question, $reporter, ReportReason::IncorrectAnswer);

        expect(fn () => $service->reportQuestion($question, $reporter, ReportReason::TypoOrGrammar))
            ->toThrow(ValidationException::class);
    });

    it('allows different users to report the same question', function () {
        $question = Question::factory()->create();
        $r1 = User::factory()->create();
        $r2 = User::factory()->create();

        $service = app(QuestionReportingService::class);
        $service->reportQuestion($question, $r1, ReportReason::IncorrectAnswer);
        $service->reportQuestion($question, $r2, ReportReason::IncorrectAnswer);

        expect(QuestionReport::where('question_id', $question->id)->count())->toBe(2);
    });
});

// ─── resolveReport ────────────────────────────────────────────────────────────

describe('QuestionReportingService::resolveReport', function () {
    it('resolves an open report', function () {
        $report = QuestionReport::factory()->create();
        $resolver = User::factory()->create();

        app(QuestionReportingService::class)->resolveReport($report, $resolver, 'Fixed.');

        expect($report->fresh()->status)->toBe(ReportStatus::Resolved);
        expect($report->fresh()->resolved_at)->not->toBeNull();
    });

    it('throws when report is already resolved', function () {
        $report = QuestionReport::factory()->resolved()->create();
        $resolver = User::factory()->create();

        expect(fn () => app(QuestionReportingService::class)->resolveReport($report, $resolver))
            ->toThrow(ValidationException::class);
    });

    it('records audit log on resolution', function () {
        $report = QuestionReport::factory()->create();
        $resolver = User::factory()->create();

        app(QuestionReportingService::class)->resolveReport($report, $resolver);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'content.report.resolved',
        ]);
    });
});

// ─── confirmReport ────────────────────────────────────────────────────────────

describe('QuestionReportingService::confirmReport', function () {
    it('confirms an open report', function () {
        $report = QuestionReport::factory()->create();
        $resolver = User::factory()->create();

        app(QuestionReportingService::class)->confirmReport($report, $resolver);

        expect($report->fresh()->status)->toBe(ReportStatus::Confirmed);
    });
});
