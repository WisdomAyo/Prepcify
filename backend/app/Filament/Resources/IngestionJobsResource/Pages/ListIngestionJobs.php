<?php

declare(strict_types=1);

namespace App\Filament\Resources\IngestionJobsResource\Pages;

use App\Filament\Resources\IngestionJobsResource;
use Filament\Resources\Pages\ListRecords;

class ListIngestionJobs extends ListRecords
{
    protected static string $resource = IngestionJobsResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
