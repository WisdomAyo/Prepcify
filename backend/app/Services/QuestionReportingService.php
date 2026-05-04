<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionReport;
use App\Models\User;
use App\Support\Enums\ReportReason;
use App\Support\Enums\ReportStatus;
use Illuminate\Validation\ValidationException;

class QuestionReportingService
{
    public function __construct(
        private readonly AuditLogService $audit,
    ) {}

    public function reportQuestion(
        Question $question,
        User $reporter,
        ReportReason $reason,
        ?string $detail = null,
    ): QuestionReport {
        $existing = QuestionReport::where('question_id', $question->id)
            ->where('reported_by', $reporter->id)
            ->where('status', ReportStatus::Open->value)
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages(['question' => 'You already have an open report for this question.']);
        }

        return QuestionReport::create([
            'question_id' => $question->id,
            'reported_by' => $reporter->id,
            'reason' => $reason->value,
            'detail' => $detail,
            'status' => ReportStatus::Open->value,
        ]);
    }

    public function resolveReport(QuestionReport $report, User $resolver, ?string $notes = null): QuestionReport
    {
        if ($report->status !== ReportStatus::Open) {
            throw ValidationException::withMessages(['report' => 'Report is not open.']);
        }

        $report->update([
            'status' => ReportStatus::Resolved,
            'resolved_by' => $resolver->id,
            'resolution_notes' => $notes,
            'resolved_at' => now(),
        ]);

        $this->audit->log(
            action: 'content.report.resolved',
            targetType: QuestionReport::class,
            targetId: $report->id,
            actor: $resolver,
        );

        return $report;
    }

    public function confirmReport(QuestionReport $report, User $resolver, ?string $notes = null): QuestionReport
    {
        if ($report->status !== ReportStatus::Open) {
            throw ValidationException::withMessages(['report' => 'Report is not open.']);
        }

        $report->update([
            'status' => ReportStatus::Confirmed,
            'resolved_by' => $resolver->id,
            'resolution_notes' => $notes,
            'resolved_at' => now(),
        ]);

        $this->audit->log(
            action: 'content.report.confirmed',
            targetType: QuestionReport::class,
            targetId: $report->id,
            actor: $resolver,
        );

        return $report;
    }
}
