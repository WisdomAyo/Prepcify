<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\ExamPapersResource\Pages;
use App\Models\ExamBody;
use App\Models\ExamPaper;
use App\Models\Subject;
use App\Services\IngestionUploadService;
use App\Support\Enums\AiProviderPreference;
use App\Support\Enums\PaperType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ExamPapersResource extends Resource
{
    protected static ?string $model = ExamPaper::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 20;

    protected static ?string $label = 'Exam Paper';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('exam_body_id')
                ->label('Exam Body')
                ->options(ExamBody::active()->orderBy('name')->pluck('name', 'id'))
                ->required()
                ->searchable(),

            Forms\Components\Select::make('subject_id')
                ->label('Subject')
                ->options(Subject::orderBy('name')->pluck('name', 'id'))
                ->required()
                ->searchable(),

            Forms\Components\TextInput::make('year')
                ->numeric()
                ->required()
                ->minValue(1980)
                ->maxValue(2099),

            Forms\Components\TextInput::make('paper_number')
                ->numeric()
                ->default(1)
                ->required(),

            Forms\Components\Select::make('paper_type')
                ->options(collect(PaperType::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name]))
                ->required(),

            Forms\Components\TextInput::make('title')
                ->maxLength(255),

            Forms\Components\TextInput::make('duration_minutes')
                ->numeric()
                ->minValue(1),

            Forms\Components\TextInput::make('total_marks')
                ->numeric()
                ->minValue(1),

            Forms\Components\Textarea::make('instructions_general')
                ->rows(3),

            Forms\Components\TextInput::make('syllabus_version')
                ->maxLength(20),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('examBody.name')->label('Exam Body')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('subject.name')->label('Subject')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('year')->sortable(),
                Tables\Columns\TextColumn::make('paper_number')->label('Paper #'),
                Tables\Columns\TextColumn::make('paper_type')->badge(),
                Tables\Columns\TextColumn::make('total_marks')->label('Marks'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('exam_body_id')
                    ->label('Exam Body')
                    ->options(ExamBody::active()->orderBy('name')->pluck('name', 'id')),
                Tables\Filters\SelectFilter::make('paper_type')
                    ->options(collect(PaperType::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name])),
            ])
            ->defaultSort('year', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('ingest')
                    ->label('Upload for AI Extraction')
                    ->icon('heroicon-o-cloud-arrow-up')
                    ->color('warning')
                    ->form([
                        Forms\Components\Select::make('provider')
                            ->label('AI Provider')
                            ->options(collect(AiProviderPreference::cases())->mapWithKeys(fn ($e) => [$e->value => ucfirst($e->value)]))
                            ->default(AiProviderPreference::Gemini->value)
                            ->required(),
                        Forms\Components\Placeholder::make('info')
                            ->content('After submitting, you will receive a presigned R2 upload URL. Upload the PDF directly to that URL, then confirm the upload via the API.'),
                    ])
                    ->action(function (ExamPaper $record, array $data): void {
                        $admin = auth()->user();
                        abort_if($admin === null, 403);
                        $service = app(IngestionUploadService::class);
                        $result = $service->createUploadUrl($record, $admin, $data['provider']);

                        Notification::make()
                            ->title('Ingestion job created')
                            ->body("Job #{$result['job_id']} created. Upload PDF to the provided URL, then confirm via API.")
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListExamPapers::route('/'),
            'create' => Pages\CreateExamPaper::route('/create'),
            'view' => Pages\ViewExamPaper::route('/{record}'),
            'edit' => Pages\EditExamPaper::route('/{record}/edit'),
        ];
    }
}
