<?php

declare(strict_types=1);

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = UserResource::class;
}
