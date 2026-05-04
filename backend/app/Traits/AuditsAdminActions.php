<?php

declare(strict_types=1);

namespace App\Traits;

use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;

trait AuditsAdminActions
{
    protected function afterCreate(): void
    {
        $record = $this->record;
        if (! $record instanceof Model) {
            return;
        }

        $resource = static::getResource();
        app(AuditLogService::class)->log(
            action: 'admin.'.str($resource::getModelLabel())->snake()->toString().'.created',
            targetType: $resource::getModel(),
            targetId: $record->getKey(),
            after: $record->toArray(),
        );
    }

    protected function afterSave(): void
    {
        $record = $this->record;
        if (! $record instanceof Model) {
            return;
        }

        $resource = static::getResource();
        app(AuditLogService::class)->log(
            action: 'admin.'.str($resource::getModelLabel())->snake()->toString().'.updated',
            targetType: $resource::getModel(),
            targetId: $record->getKey(),
            before: $record->getOriginal(),
            after: $record->getChanges(),
        );
    }

    protected function afterDelete(): void
    {
        $record = $this->record;
        if (! $record instanceof Model) {
            return;
        }

        $resource = static::getResource();
        app(AuditLogService::class)->log(
            action: 'admin.'.str($resource::getModelLabel())->snake()->toString().'.deleted',
            targetType: $resource::getModel(),
            targetId: $record->getKey(),
            before: $record->toArray(),
        );
    }
}
