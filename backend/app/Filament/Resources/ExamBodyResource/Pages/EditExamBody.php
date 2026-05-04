<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamBodyResource\Pages;

use App\Filament\Resources\ExamBodyResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditExamBody extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = ExamBodyResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
