<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionDraftsResource\Pages;

use App\Filament\Resources\QuestionDraftsResource;
use App\Traits\AuditsAdminActions;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditQuestionDraft extends EditRecord
{
    use AuditsAdminActions;

    protected static string $resource = QuestionDraftsResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\ViewAction::make()];
    }
}
