<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\ExamSubjectResource\Pages;
use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\Subject;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ExamSubjectResource extends Resource
{
    protected static ?string $model = ExamSubject::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationLabel = 'Exam Subjects';

    protected static ?int $navigationSort = 12;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('exam_body_id')
                ->required()
                ->label('Exam Body')
                ->options(ExamBody::pluck('name', 'id'))
                ->searchable(),

            Forms\Components\Select::make('subject_id')
                ->required()
                ->label('Subject')
                ->options(Subject::pluck('name', 'id'))
                ->searchable(),

            Forms\Components\Toggle::make('is_compulsory')->default(false),

            Forms\Components\TextInput::make('syllabus_version')
                ->required()
                ->default('1.0')
                ->maxLength(20),

            Forms\Components\DatePicker::make('syllabus_effective_from')->required(),

            Forms\Components\DatePicker::make('syllabus_effective_to'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('examBody.name')->label('Exam Body')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('subject.name')->label('Subject')->searchable()->sortable(),
                Tables\Columns\IconColumn::make('is_compulsory')->boolean(),
                Tables\Columns\TextColumn::make('syllabus_version'),
                Tables\Columns\TextColumn::make('syllabus_effective_from')->date(),
                Tables\Columns\TextColumn::make('syllabus_effective_to')->date()->placeholder('Current'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('exam_body_id')
                    ->label('Exam Body')
                    ->relationship('examBody', 'name'),
                Tables\Filters\SelectFilter::make('subject_id')
                    ->label('Subject')
                    ->relationship('subject', 'name'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListExamSubjects::route('/'),
            'create' => Pages\CreateExamSubject::route('/create'),
            'view' => Pages\ViewExamSubject::route('/{record}'),
            'edit' => Pages\EditExamSubject::route('/{record}/edit'),
        ];
    }
}
