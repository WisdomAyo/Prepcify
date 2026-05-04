<?php

declare(strict_types=1);

namespace App\Filament\Resources\IngestionJobsResource\Pages;

use App\Filament\Resources\IngestionJobsResource;
use App\Models\IngestionJob;
use App\Support\Enums\IngestionStatus;
use Filament\Actions;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewIngestionJob extends ViewRecord
{
    protected static string $resource = IngestionJobsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make()
                ->visible(function (): bool {
                    $record = $this->record;
                    if (! $record instanceof IngestionJob) {
                        return false;
                    }

                    return in_array($record->status, [IngestionStatus::Cancelled, IngestionStatus::Failed], true);
                }),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Section::make('Exam Paper')->schema([
                TextEntry::make('examPaper.examBody.name')->label('Exam Body'),
                TextEntry::make('examPaper.subject.name')->label('Subject'),
                TextEntry::make('examPaper.year')->label('Year'),
            ])->columns(3),

            Section::make('Job Configuration')->schema([
                TextEntry::make('status')->badge()
                    ->color(fn (IngestionStatus $state) => match ($state) {
                        IngestionStatus::Queued => 'gray',
                        IngestionStatus::Splitting, IngestionStatus::Extracting => 'warning',
                        IngestionStatus::Completed => 'success',
                        IngestionStatus::PartiallyFailed => 'warning',
                        IngestionStatus::Failed, IngestionStatus::Cancelled => 'danger',
                    }),
                TextEntry::make('ai_provider_preferred')->label('AI Provider')->badge()->color('info'),
                TextEntry::make('extraction_method')->label('Method'),
                TextEntry::make('created_at')->label('Submitted')->dateTime(),
                TextEntry::make('completed_at')->label('Completed')->dateTime()->placeholder('—'),
                TextEntry::make('creator.display_name')->label('Submitted By'),
            ])->columns(3),

            Section::make('Progress')->schema([
                TextEntry::make('total_pages')->label('Total Pages')->placeholder('—'),
                TextEntry::make('questions_extracted')->label('Questions Extracted')->placeholder('—'),
                TextEntry::make('estimated_cost_usd')->label('Estimated Cost')->money('USD')->placeholder('—'),
                TextEntry::make('actual_cost_usd')->label('Actual Cost')->money('USD')->placeholder('—'),
            ])->columns(4),

            Section::make('Error Details')->schema([
                TextEntry::make('error_summary')->label('Error Summary')->columnSpanFull()->placeholder('No errors'),
            ])->collapsed()->visible(fn ($record) => filled($record->error_summary)),

            Section::make('Pages')->schema([
                RepeatableEntry::make('pages')->schema([
                    Grid::make(5)->schema([
                        TextEntry::make('page_number')->label('Page'),
                        TextEntry::make('status')->badge()
                            ->color(fn (string $state) => match ($state) {
                                'completed' => 'success',
                                'failed' => 'danger',
                                'skipped' => 'gray',
                                'extracting' => 'warning',
                                default => 'secondary',
                            }),
                        TextEntry::make('questions_extracted')->label('Questions')->placeholder('—'),
                        TextEntry::make('cost_usd')->label('Cost')->money('USD')->placeholder('—'),
                        TextEntry::make('error')->label('Error')->placeholder('—'),
                    ]),
                ])->columnSpanFull(),
            ]),
        ]);
    }
}
