<?php

declare(strict_types=1);

namespace App\Filament\Resources\RoleResource\Pages;

use App\Filament\Resources\RoleResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateRole extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = RoleResource::class;
}
