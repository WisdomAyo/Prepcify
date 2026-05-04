<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamSubjectResource\Pages;

use App\Filament\Resources\ExamSubjectResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateExamSubject extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = ExamSubjectResource::class;
}
