<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\QuestionsResource\Pages;
use App\Models\ExamSubject;
use App\Models\Question;
use App\Support\Enums\QuestionFormat;
use App\Support\Enums\QuestionStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuestionsResource extends Resource
{
    protected static ?string $model = Question::class;

    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 21;

    protected static ?string $label = 'Question';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('exam_subject_id')
                ->label('Exam Subject')
                ->options(
                    ExamSubject::with('subject', 'examBody')
                        ->get()
                        ->mapWithKeys(fn ($es) => [$es->id => "{$es->examBody->name} — {$es->subject->name}"]),
                )
                ->required()
                ->searchable(),

            Forms\Components\Select::make('format')
                ->options(collect(QuestionFormat::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name]))
                ->required()
                ->live(),

            Forms\Components\Select::make('status')
                ->options(collect(QuestionStatus::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name]))
                ->required(),

            Forms\Components\Textarea::make('stem')
                ->required()
                ->rows(4),

            Forms\Components\Textarea::make('explanation')
                ->rows(3),

            Forms\Components\TextInput::make('year')
                ->numeric()
                ->minValue(2000)
                ->maxValue(2099),

            Forms\Components\TextInput::make('marks')
                ->numeric()
                ->default(1)
                ->minValue(1),

            // MCQ options — only visible for mcq format
            Forms\Components\Repeater::make('options')
                ->relationship()
                ->schema([
                    Forms\Components\TextInput::make('label')->required()->maxLength(5),
                    Forms\Components\Textarea::make('body')->required()->rows(2),
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                ])
                ->columns(3)
                ->visible(fn (Forms\Get $get) => $get('format') === QuestionFormat::Mcq->value)
                ->label('Answer Options'),

            Forms\Components\TextInput::make('correct_option_id')
                ->numeric()
                ->label('Correct Option ID')
                ->visible(fn (Forms\Get $get) => $get('format') === QuestionFormat::Mcq->value),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('examSubject.subject.name')->label('Subject')->searchable(),
                Tables\Columns\TextColumn::make('format')->badge(),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn ($state) => match ($state->value ?? $state) {
                        'published' => 'success',
                        'draft' => 'warning',
                        'archived' => 'gray',
                        default => 'danger',
                    }),
                Tables\Columns\TextColumn::make('year')->sortable(),
                Tables\Columns\TextColumn::make('stem')->limit(60)->searchable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('format')
                    ->options(collect(QuestionFormat::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name])),
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(QuestionStatus::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name])),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->defaultSort('id', 'desc')
            ->actions([Tables\Actions\ViewAction::make(), Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListQuestions::route('/'),
            'create' => Pages\CreateQuestion::route('/create'),
            'view' => Pages\ViewQuestion::route('/{record}'),
            'edit' => Pages\EditQuestion::route('/{record}/edit'),
        ];
    }
}
