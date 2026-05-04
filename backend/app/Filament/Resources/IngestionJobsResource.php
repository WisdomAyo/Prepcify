<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\IngestionJobsResource\Pages;
use App\Models\ExamBody;
use App\Models\ExamPaper;
use App\Models\IngestionJob;
use App\Models\Subject;
use App\Support\Enums\AiProviderPreference;
use App\Support\Enums\ExtractionMethod;
use App\Support\Enums\IngestionStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class IngestionJobsResource extends Resource
{
    protected static ?string $model = IngestionJob::class;

    protected static ?string $navigationIcon = 'heroicon-o-cloud-arrow-up';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 50;

    protected static ?string $label = 'Ingestion Job';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Job Details')->schema([
                Forms\Components\Select::make('exam_paper_id')
                    ->label('Exam Paper')
                    ->options(
                        ExamPaper::with(['examBody', 'subject'])
                            ->get()
                            ->mapWithKeys(function (ExamPaper $p): array {
                                $body = $p->examBody instanceof ExamBody ? $p->examBody->name : '?';
                                $sub = $p->subject instanceof Subject ? $p->subject->name : '?';

                                return [$p->id => "{$body} — {$sub} {$p->year}"];
                            }),
                    )
                    ->required()
                    ->searchable()
                    ->disabled(fn ($record) => $record !== null),

                Forms\Components\Select::make('ai_provider_preferred')
                    ->label('AI Provider')
                    ->options(collect(AiProviderPreference::cases())->mapWithKeys(fn ($e) => [$e->value => ucfirst($e->value)]))
                    ->default(AiProviderPreference::Gemini->value)
                    ->required()
                    ->disabled(fn ($record) => $record !== null),

                Forms\Components\Select::make('extraction_method')
                    ->label('Extraction Method')
                    ->options(collect(ExtractionMethod::cases())->mapWithKeys(fn ($e) => [$e->value => str_replace('_', ' ', ucwords($e->value, '_'))]))
                    ->default(ExtractionMethod::VisionOnly->value)
                    ->required()
                    ->disabled(fn ($record) => $record !== null),
            ])->columns(3),

            Forms\Components\Section::make('Status & Progress')->schema([
                Forms\Components\TextInput::make('status')
                    ->disabled(),

                Forms\Components\TextInput::make('total_pages')
                    ->label('Total Pages')
                    ->numeric()
                    ->disabled(),

                Forms\Components\TextInput::make('questions_extracted')
                    ->label('Questions Extracted')
                    ->numeric()
                    ->disabled(),

                Forms\Components\TextInput::make('actual_cost_usd')
                    ->label('Actual Cost (USD)')
                    ->disabled(),

                Forms\Components\Textarea::make('error_summary')
                    ->label('Error Summary')
                    ->disabled()
                    ->rows(3)
                    ->columnSpanFull(),
            ])->columns(4)->visibleOn('view'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),

                Tables\Columns\TextColumn::make('examPaper.examBody.name')
                    ->label('Exam Body')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('examPaper.subject.name')
                    ->label('Subject')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('examPaper.year')
                    ->label('Year')
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (IngestionStatus $state) => match ($state) {
                        IngestionStatus::Queued => 'gray',
                        IngestionStatus::Splitting, IngestionStatus::Extracting => 'warning',
                        IngestionStatus::Completed => 'success',
                        IngestionStatus::PartiallyFailed => 'warning',
                        IngestionStatus::Failed => 'danger',
                        IngestionStatus::Cancelled => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('ai_provider_preferred')
                    ->label('Provider')
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('total_pages')
                    ->label('Pages')
                    ->default('—'),

                Tables\Columns\TextColumn::make('questions_extracted')
                    ->label('Questions')
                    ->default('—'),

                Tables\Columns\TextColumn::make('actual_cost_usd')
                    ->label('Cost')
                    ->money('USD')
                    ->default('—'),

                Tables\Columns\TextColumn::make('creator.display_name')
                    ->label('Submitted By')
                    ->searchable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(IngestionStatus::cases())->mapWithKeys(fn ($e) => [$e->value => ucfirst(str_replace('_', ' ', $e->value))])),

                Tables\Filters\SelectFilter::make('ai_provider_preferred')
                    ->label('AI Provider')
                    ->options(collect(AiProviderPreference::cases())->mapWithKeys(fn ($e) => [$e->value => ucfirst($e->value)])),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->visible(fn (IngestionJob $record) => in_array($record->status, [
                        IngestionStatus::Cancelled, IngestionStatus::Failed,
                    ], true)),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListIngestionJobs::route('/'),
            'view' => Pages\ViewIngestionJob::route('/{record}'),
        ];
    }
}
