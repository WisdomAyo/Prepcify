<?php

declare(strict_types=1);

namespace App\Filament\Resources\SubjectResource\Pages;

use App\Filament\Resources\SubjectResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateSubject extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = SubjectResource::class;
}
