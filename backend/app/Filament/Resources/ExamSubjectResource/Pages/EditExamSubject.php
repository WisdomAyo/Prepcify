<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamSubjectResource\Pages;

use App\Filament\Resources\ExamSubjectResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditExamSubject extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = ExamSubjectResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
