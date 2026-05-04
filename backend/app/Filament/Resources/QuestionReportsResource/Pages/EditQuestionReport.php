<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionReportsResource\Pages;

use App\Filament\Resources\QuestionReportsResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditQuestionReport extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = QuestionReportsResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\ViewAction::make()];
    }
}
