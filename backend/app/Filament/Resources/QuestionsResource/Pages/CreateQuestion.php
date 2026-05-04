<?php

declare(strict_types=1);

namespace App\Filament\Resources\QuestionsResource\Pages;

use App\Filament\Resources\QuestionsResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateQuestion extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = QuestionsResource::class;
}
