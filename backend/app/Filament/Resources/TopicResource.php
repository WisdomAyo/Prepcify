<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\TopicResource\Pages;
use App\Models\ExamSubject;
use App\Models\Topic;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class TopicResource extends Resource
{
    protected static ?string $model = Topic::class;

    protected static ?string $navigationIcon = 'heroicon-o-list-bullet';

    protected static ?int $navigationSort = 13;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('exam_subject_id')
                ->required()
                ->label('Exam Subject')
                ->options(
                    ExamSubject::with(['examBody', 'subject'])
                        ->get()
                        ->mapWithKeys(fn ($es) => [$es->id => "{$es->examBody->name} — {$es->subject->name} (v{$es->syllabus_version})"]),
                )
                ->searchable(),

            Forms\Components\Select::make('parent_topic_id')
                ->label('Parent Topic')
                ->options(Topic::orderBy('path')->pluck('path', 'id'))
                ->searchable()
                ->nullable(),

            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255)
                ->live(debounce: 400)
                ->afterStateUpdated(fn ($state, Forms\Set $set) => $set('slug', Str::slug($state))),

            Forms\Components\TextInput::make('slug')
                ->required()
                ->maxLength(255),

            Forms\Components\TextInput::make('path')
                ->required()
                ->maxLength(500),

            Forms\Components\TextInput::make('depth')
                ->numeric()
                ->default(0),

            Forms\Components\TextInput::make('sort_order')
                ->numeric()
                ->default(0),

            Forms\Components\Textarea::make('syllabus_notes')->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('examSubject.examBody.name')->label('Exam')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('examSubject.subject.name')->label('Subject')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('path')->searchable(),
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('depth')->sortable(),
                Tables\Columns\TextColumn::make('sort_order')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('exam_subject_id')
                    ->label('Exam Subject')
                    ->relationship('examSubject', 'id'),
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
            'index' => Pages\ListTopics::route('/'),
            'create' => Pages\CreateTopic::route('/create'),
            'view' => Pages\ViewTopic::route('/{record}'),
            'edit' => Pages\EditTopic::route('/{record}/edit'),
        ];
    }
}
