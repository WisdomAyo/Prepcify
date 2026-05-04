<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImpersonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    public function __construct(
        private readonly ImpersonationService $impersonationService,
    ) {}

    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        /** @var User $actor */
        $actor = $request->user();

        $result = $this->impersonationService->start(
            $actor,
            (int) $validated['user_id'],
        );

        return response()->json(['data' => $result]);
    }

    public function end(Request $request): JsonResponse
    {
        $token = $request->input('token', '');

        $this->impersonationService->end(is_string($token) ? $token : '');

        return response()->json(['ended' => true]);
    }
}
