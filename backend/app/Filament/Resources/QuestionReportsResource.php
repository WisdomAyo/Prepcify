<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\QuestionReportsResource\Pages;
use App\Models\QuestionReport;
use App\Models\User;
use App\Services\QuestionReportingService;
use App\Support\Enums\ReportReason;
use App\Support\Enums\ReportStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;

class QuestionReportsResource extends Resource
{
    protected static ?string $model = QuestionReport::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 23;

    protected static ?string $label = 'Question Report';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('status')
                ->options(collect(ReportStatus::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name]))
                ->required(),

            Forms\Components\Textarea::make('resolution_notes')
                ->rows(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('question.stem')->label('Question')->limit(60),
                Tables\Columns\TextColumn::make('reporter.display_name')->label('Reported By'),
                Tables\Columns\TextColumn::make('reason')->badge(),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn ($state) => match ($state->value ?? $state) {
                        'resolved' => 'success',
                        'confirmed' => 'warning',
                        'dismissed' => 'gray',
                        default => 'danger',
                    }),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(ReportStatus::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name]))
                    ->default(ReportStatus::Open->value),
                Tables\Filters\SelectFilter::make('reason')
                    ->options(collect(ReportReason::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name])),
            ])
            ->defaultSort('created_at')
            ->actions([
                Tables\Actions\ViewAction::make(),
                Action::make('resolve')
                    ->label('Resolve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (QuestionReport $record) => $record->status === ReportStatus::Open)
                    ->form([
                        Forms\Components\Textarea::make('resolution_notes')->rows(2),
                    ])
                    ->action(function (QuestionReport $record, array $data): void {
                        $resolver = auth()->user();
                        if (! $resolver instanceof User) {
                            return;
                        }

                        app(QuestionReportingService::class)->resolveReport(
                            report: $record,
                            resolver: $resolver,
                            notes: $data['resolution_notes'] ?? null,
                        );
                        Notification::make()->title('Report resolved')->success()->send();
                    }),
            ])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListQuestionReports::route('/'),
            'view' => Pages\ViewQuestionReport::route('/{record}'),
            'edit' => Pages\EditQuestionReport::route('/{record}/edit'),
        ];
    }
}
