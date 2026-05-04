<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Support\Enums\QuestionStatus;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class CoverageHeatmapWidget extends Widget
{
    protected static string $view = 'filament.widgets.coverage-heatmap';

    protected static ?int $sort = 5;

    protected int|string|array $columnSpan = 'full';

    /** @var array<int, array{subject: string, by_year: array<int, int>}> */
    public array $rows = [];

    /** @var array<int, int> */
    public array $years = [];

    /** @var array<int, string> */
    public array $subjects = [];

    public function mount(): void
    {
        $this->loadData();
    }

    private function loadData(): void
    {
        $counts = DB::table('questions')
            ->join('exam_subjects', 'questions.exam_subject_id', '=', 'exam_subjects.id')
            ->join('subjects', 'exam_subjects.subject_id', '=', 'subjects.id')
            ->where('questions.status', QuestionStatus::Published->value)
            ->whereNull('questions.deleted_at')
            ->whereNotNull('questions.year')
            ->select(
                'subjects.id as subject_id',
                'subjects.name as subject_name',
                'questions.year',
                DB::raw('COUNT(*) as total'),
            )
            ->groupBy('subjects.id', 'subjects.name', 'questions.year')
            ->orderBy('subjects.name')
            ->orderBy('questions.year')
            ->get();

        /** @var array<int, int> */
        $years = $counts->pluck('year')->unique()->sort()->values()->toArray();
        $this->years = $years;

        $grouped = $counts->groupBy('subject_id');

        $rows = [];
        foreach ($grouped as $subjectRows) {
            $first = $subjectRows->first();
            $subjectName = $first !== null ? (string) ($first->subject_name ?? '') : '';
            $byYear = [];
            foreach ($subjectRows as $row) {
                if ($row->year !== null) {
                    $byYear[(int) $row->year] = (int) $row->total;
                }
            }
            $rows[] = ['subject' => $subjectName, 'by_year' => $byYear];
        }

        $this->rows = $rows;
    }
}
