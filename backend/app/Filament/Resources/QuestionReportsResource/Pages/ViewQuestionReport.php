<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionReportsResource\Pages;

use App\Filament\Resources\QuestionReportsResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewQuestionReport extends ViewRecord
{
    protected static string $resource = QuestionReportsResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\EditAction::make()];
    }
}
