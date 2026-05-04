<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\AuditLogResource\Pages;
use App\Models\AuditLog;
use App\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class AuditLogResource extends Resource
{
    protected static ?string $model = AuditLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-magnifying-glass';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 90;

    protected static ?string $label = 'Audit Log';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['Superadmin', 'Operations Admin']) ?? false;
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('actor.display_name')
                    ->label('Actor')
                    ->default('System')
                    ->searchable(),
                Tables\Columns\TextColumn::make('action')->searchable(),
                Tables\Columns\TextColumn::make('target_type')
                    ->formatStateUsing(fn (?string $state) => $state !== null ? class_basename($state) : '—'),
                Tables\Columns\TextColumn::make('target_id'),
                Tables\Columns\TextColumn::make('ip_address'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('actor')
                    ->form([
                        Select::make('actor_user_id')
                            ->label('Actor')
                            ->options(User::whereNotNull('display_name')->pluck('display_name', 'id'))
                            ->searchable(),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query->when($data['actor_user_id'] ?? null, fn (Builder $q, int $id) => $q->where('actor_user_id', $id)),
                    ),

                Filter::make('target_type')
                    ->form([
                        TextInput::make('target_type')
                            ->label('Target Type (class name fragment)'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query->when($data['target_type'] ?? null, fn (Builder $q, string $val) => $q->where('target_type', 'like', '%'.$val.'%')),
                    ),

                Filter::make('action')
                    ->form([
                        TextInput::make('action')->label('Action contains'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query->when($data['action'] ?? null, fn (Builder $q, string $val) => $q->where('action', 'like', '%'.$val.'%')),
                    ),

                Filter::make('date_range')
                    ->form([
                        DatePicker::make('from')->label('From'),
                        DatePicker::make('until')->label('Until'),
                    ])
                    ->query(fn (Builder $query, array $data): Builder => $query
                        ->when($data['from'] ?? null, fn (Builder $q, string $d) => $q->whereDate('created_at', '>=', $d))
                        ->when($data['until'] ?? null, fn (Builder $q, string $d) => $q->whereDate('created_at', '<=', $d)),
                    ),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAuditLogs::route('/'),
            'view' => Pages\ViewAuditLog::route('/{record}'),
        ];
    }
}
