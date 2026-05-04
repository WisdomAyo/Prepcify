<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionsResource\Pages;

use App\Filament\Resources\QuestionsResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditQuestion extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = QuestionsResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\ViewAction::make(), Actions\DeleteAction::make()];
    }
}
