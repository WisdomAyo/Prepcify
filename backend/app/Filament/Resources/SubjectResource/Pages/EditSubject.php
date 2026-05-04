<?php

declare(strict_types=1);

namespace App\Filament\Resources\SubjectResource\Pages;

use App\Filament\Resources\SubjectResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSubject extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = SubjectResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
