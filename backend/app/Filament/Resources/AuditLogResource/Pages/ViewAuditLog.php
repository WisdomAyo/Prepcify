<?php

declare(strict_types=1);

namespace App\Filament\Resources\AuditLogResource\Pages;

use App\Filament\Resources\AuditLogResource;
use Filament\Infolists\Components\KeyValueEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewAuditLog extends ViewRecord
{
    protected static string $resource = AuditLogResource::class;

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            TextEntry::make('id'),
            TextEntry::make('actor.display_name')->label('Actor')->default('System'),
            TextEntry::make('action'),
            TextEntry::make('target_type'),
            TextEntry::make('target_id'),
            TextEntry::make('ip_address'),
            TextEntry::make('user_agent'),
            TextEntry::make('created_at')->dateTime(),
            KeyValueEntry::make('before')->label('Before')->columnSpanFull(),
            KeyValueEntry::make('after')->label('After')->columnSpanFull(),
            KeyValueEntry::make('metadata')->label('Metadata')->columnSpanFull(),
        ]);
    }
}
