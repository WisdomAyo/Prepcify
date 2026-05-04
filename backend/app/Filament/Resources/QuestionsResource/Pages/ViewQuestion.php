<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionsResource\Pages;

use App\Filament\Resources\QuestionsResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewQuestion extends ViewRecord
{
    protected static string $resource = QuestionsResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\EditAction::make()];
    }
}
