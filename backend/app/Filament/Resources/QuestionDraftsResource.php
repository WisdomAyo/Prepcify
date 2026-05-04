<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\QuestionDraftsResource\Pages;
use App\Models\QuestionDraft;
use App\Models\User;
use App\Support\Enums\DraftStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\BulkAction;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class QuestionDraftsResource extends Resource
{
    protected static ?string $model = QuestionDraft::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 22;

    protected static ?string $label = 'Question Draft';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('status')
                ->options(collect(DraftStatus::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name]))
                ->required(),

            Forms\Components\Select::make('assigned_reviewer_id')
                ->label('Assigned Reviewer')
                ->options(
                    User::where('user_type', 'admin')->orderBy('display_name')->pluck('display_name', 'id'),
                )
                ->searchable()
                ->nullable(),

            Forms\Components\Textarea::make('reviewer_notes')
                ->rows(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('question.stem')->label('Question')->limit(60),
                Tables\Columns\TextColumn::make('question.examSubject.subject.name')->label('Subject'),
                Tables\Columns\TextColumn::make('submitter.display_name')->label('Submitted By'),
                Tables\Columns\TextColumn::make('reviewer.display_name')->label('Reviewer'),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn ($state) => match ($state->value ?? $state) {
                        'approved' => 'success',
                        'rejected' => 'danger',
                        'escalated' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('submitted_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(DraftStatus::cases())->mapWithKeys(fn ($e) => [$e->value => $e->name])),
            ])
            ->defaultSort('submitted_at')
            ->actions([Tables\Actions\ViewAction::make(), Tables\Actions\EditAction::make()])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    BulkAction::make('assign_reviewer')
                        ->label('Assign Reviewer')
                        ->icon('heroicon-o-user')
                        ->form([
                            Forms\Components\Select::make('assigned_reviewer_id')
                                ->label('Reviewer')
                                ->options(
                                    User::where('user_type', 'admin')->orderBy('display_name')->pluck('display_name', 'id'),
                                )
                                ->required(),
                        ])
                        ->action(function (Collection $records, array $data): void {
                            $records->each(function (Model $record) use ($data): void {
                                $record->update([
                                    'assigned_reviewer_id' => $data['assigned_reviewer_id'],
                                    'status' => DraftStatus::UnderReview,
                                ]);
                            });
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListQuestionDrafts::route('/'),
            'view' => Pages\ViewQuestionDraft::route('/{record}'),
            'edit' => Pages\EditQuestionDraft::route('/{record}/edit'),
        ];
    }
}
