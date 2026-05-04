<?php

declare(strict_types=1);

namespace App\Filament\Resources\TopicResource\Pages;

use App\Filament\Resources\TopicResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTopic extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = TopicResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
