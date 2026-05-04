<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionDraftsResource\Pages;

use App\Filament\Resources\QuestionDraftsResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewQuestionDraft extends ViewRecord
{
    protected static string $resource = QuestionDraftsResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\EditAction::make()];
    }
}
