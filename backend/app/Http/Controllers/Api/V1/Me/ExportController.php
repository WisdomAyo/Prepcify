<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Me;

use App\Jobs\UserDataExportJob;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ExportController
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $key = 'user_data_export:'.$user->id;

        if (! Cache::add($key, 'queued', now()->addHours(24))) {
            return response()->json([
                'queued' => false,
                'message' => 'An export was already requested recently. Check your email.',
            ]);
        }

        UserDataExportJob::dispatch($user->id);

        return response()->json(['queued' => true]);
    }
}
