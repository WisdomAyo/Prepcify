<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ImpersonationService
{
    private const TOKEN_TTL_MINUTES = 30;

    private const CACHE_PREFIX = 'impersonation_token:';

    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /** @return array{token: string, expires_at: string} */
    public function start(User $actor, int $targetUserId): array
    {
        if (! $actor->hasPermissionTo('users.impersonate')) {
            throw new AccessDeniedHttpException('You do not have permission to impersonate users.');
        }

        $target = User::findOrFail($targetUserId);

        $token = Str::random(64);
        $expiresAt = now()->addMinutes(self::TOKEN_TTL_MINUTES);

        Cache::put(self::CACHE_PREFIX.$token, [
            'actor_id' => $actor->id,
            'target_id' => $target->id,
        ], $expiresAt);

        $this->auditLogService->log(
            action: 'admin.impersonation.start',
            targetType: User::class,
            targetId: $target->id,
            metadata: ['actor_id' => $actor->id, 'actor_display_name' => $actor->display_name],
            actor: $actor,
        );

        return [
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    /** @return array{actor_id: int, target_id: int}|null */
    public function resolve(string $token): ?array
    {
        /** @var array{actor_id: int, target_id: int}|null */
        return Cache::get(self::CACHE_PREFIX.$token);
    }

    public function end(string $token): void
    {
        $data = $this->resolve($token);

        if ($data === null) {
            return;
        }

        Cache::forget(self::CACHE_PREFIX.$token);

        $actor = User::find($data['actor_id']);

        $this->auditLogService->log(
            action: 'admin.impersonation.end',
            targetType: User::class,
            targetId: $data['target_id'],
            metadata: ['actor_id' => $data['actor_id']],
            actor: $actor,
        );
    }
}
