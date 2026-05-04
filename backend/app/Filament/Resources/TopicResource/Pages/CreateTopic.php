<?php

declare(strict_types=1);

namespace App\Filament\Resources\TopicResource\Pages;

use App\Filament\Resources\TopicResource;
use App\Traits\AuditsAdminActions;
use Filament\Resources\Pages\CreateRecord;

class CreateTopic extends CreateRecord
{
    use AuditsAdminActions;

    protected static string $resource = TopicResource::class;
}
