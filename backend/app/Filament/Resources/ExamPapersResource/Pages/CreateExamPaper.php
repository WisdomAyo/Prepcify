<?php

declare(strict_types=1);

namespace App\Filament\Resources\ExamPapersResource\Pages;

use App\Filament\Resources\ExamPapersResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateExamPaper extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = ExamPapersResource::class;
}
