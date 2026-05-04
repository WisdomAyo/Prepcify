<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamBodyResource\Pages;

use App\Filament\Resources\ExamBodyResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateExamBody extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = ExamBodyResource::class;
}
