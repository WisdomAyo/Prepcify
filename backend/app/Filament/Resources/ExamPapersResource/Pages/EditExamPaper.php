<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamPapersResource\Pages;

use App\Filament\Resources\ExamPapersResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditExamPaper extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = ExamPapersResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\ViewAction::make(), Actions\DeleteAction::make()];
    }
}
