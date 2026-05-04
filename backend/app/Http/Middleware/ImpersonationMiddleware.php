<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\ImpersonationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ImpersonationMiddleware
{
    public function __construct(
        private readonly ImpersonationService $impersonationService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?? $request->header('X-Impersonation-Token');

        if ($token !== null) {
            $data = $this->impersonationService->resolve($token);

            if ($data !== null) {
                $target = User::find($data['target_id']);

                if ($target instanceof User) {
                    auth()->setUser($target);
                    $request->headers->set('X-Impersonated-By', (string) $data['actor_id']);
                }
            }
        }

        return $next($request);
    }
}
