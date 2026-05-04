<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamBodyResource\Pages;

use App\Filament\Resources\ExamBodyResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListExamBodies extends ListRecords
{
    protected static string $resource = ExamBodyResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
