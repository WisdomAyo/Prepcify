<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuditLogService
{
    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     * @param  array<string, mixed>|null  $metadata
     */
    public function log(
        string $action,
        ?string $targetType = null,
        int|string|null $targetId = null,
        ?array $before = null,
        ?array $after = null,
        ?array $metadata = null,
        ?User $actor = null,
    ): ?AuditLog {
        try {
            return AuditLog::create([
                'actor_user_id' => $actor !== null ? $actor->id : auth()->id(),
                'action' => $action,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'before' => $before,
                'after' => $after,
                'metadata' => $metadata,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);
        } catch (Throwable $e) {
            // Never let audit failures break the request
            Log::error('AuditLogService: failed to write audit log', [
                'action' => $action,
                'exception' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
