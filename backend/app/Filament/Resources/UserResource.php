<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Jobs\UserDataExportJob;
use App\Models\User;
use App\Support\Enums\UserType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('display_name')
                ->maxLength(100),

            Forms\Components\TextInput::make('first_name')
                ->maxLength(100),

            Forms\Components\TextInput::make('last_name')
                ->maxLength(100),

            Forms\Components\TextInput::make('email')
                ->email()
                ->unique(User::class, 'email', ignoreRecord: true),

            Forms\Components\TextInput::make('phone')
                ->unique(User::class, 'phone', ignoreRecord: true),

            Forms\Components\Select::make('user_type')
                ->options(collect(UserType::cases())->mapWithKeys(fn ($e) => [$e->value => $e->label()]))
                ->required(),

            Forms\Components\Select::make('timezone')
                ->options([
                    'Africa/Lagos' => 'Africa/Lagos (WAT)',
                    'Africa/Accra' => 'Africa/Accra (GMT)',
                    'Europe/London' => 'Europe/London (GMT/BST)',
                    'America/New_York' => 'America/New_York (EST/EDT)',
                    'UTC' => 'UTC',
                ])
                ->default('Africa/Lagos'),

            // Role assignment — Superadmin only
            Forms\Components\Select::make('roles')
                ->label('Admin Roles')
                ->multiple()
                ->options(Role::pluck('name', 'name'))
                ->visible(fn () => auth()->user()?->hasRole('Superadmin'))
                ->relationship('roles', 'name'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('display_name')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('phone')->searchable(),
                Tables\Columns\TextColumn::make('user_type')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state instanceof UserType ? $state->label() : $state),
                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('deleted_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('user_type')
                    ->options(collect(UserType::cases())->mapWithKeys(fn ($e) => [$e->value => $e->label()])),
                Tables\Filters\SelectFilter::make('roles')
                    ->relationship('roles', 'name')
                    ->label('Role'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('export_data')
                    ->label('Export Data')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->visible(fn () => auth()->user()?->hasPermissionTo('users.export_data'))
                    ->action(function (User $record): void {
                        UserDataExportJob::dispatch($record->id);
                        Notification::make()->title('Export queued — user will be emailed.')->success()->send();
                    }),
                Tables\Actions\DeleteAction::make()->label('Soft Delete'),
                Tables\Actions\RestoreAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    /** @return Builder<User> */
    public static function getEloquentQuery(): Builder
    {
        return User::withTrashed();
    }
}
