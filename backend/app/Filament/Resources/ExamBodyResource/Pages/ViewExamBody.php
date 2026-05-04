<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamBodyResource\Pages;

use App\Filament\Resources\ExamBodyResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewExamBody extends ViewRecord
{
    protected static string $resource = ExamBodyResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\EditAction::make()];
    }
}
