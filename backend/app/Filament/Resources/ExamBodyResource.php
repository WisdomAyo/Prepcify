<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\ExamBodyResource\Pages;
use App\Models\ExamBody;
use App\Support\Enums\ExamCategory;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ExamBodyResource extends Resource
{
    protected static ?string $model = ExamBody::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('code')
                ->required()
                ->maxLength(20)
                ->unique(ExamBody::class, 'code', ignoreRecord: true),

            Forms\Components\TextInput::make('name')
                ->required()
                ->maxLength(255),

            Forms\Components\Select::make('category')
                ->required()
                ->options(collect(ExamCategory::cases())->mapWithKeys(fn ($e) => [$e->value => $e->label()])),

            Forms\Components\Select::make('status')
                ->required()
                ->options(['active' => 'Active', 'hidden' => 'Hidden'])
                ->default('active'),

            Forms\Components\Textarea::make('description')->columnSpanFull(),

            Forms\Components\TextInput::make('logo_url')->maxLength(500)->columnSpanFull(),

            Forms\Components\TextInput::make('sort_order')
                ->numeric()
                ->default(0),

            Forms\Components\KeyValue::make('config')
                ->label('Config (JSON)')
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('name')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('category')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state instanceof ExamCategory ? $state->label() : $state),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('sort_order')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->options(collect(ExamCategory::cases())->mapWithKeys(fn ($e) => [$e->value => $e->label()])),
                Tables\Filters\SelectFilter::make('status')
                    ->options(['active' => 'Active', 'hidden' => 'Hidden']),
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
            'index' => Pages\ListExamBodies::route('/'),
            'create' => Pages\CreateExamBody::route('/create'),
            'view' => Pages\ViewExamBody::route('/{record}'),
            'edit' => Pages\EditExamBody::route('/{record}/edit'),
        ];
    }
}
