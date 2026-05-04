<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamPapersResource\Pages;

use App\Filament\Resources\ExamPapersResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewExamPaper extends ViewRecord
{
    protected static string $resource = ExamPapersResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\EditAction::make()];
    }
}
