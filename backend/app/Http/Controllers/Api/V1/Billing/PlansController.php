<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Billing;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PlansController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $plans = Plan::where('active', true)
            ->orderBy('sort_order')
            ->with('prices')
            ->get();

        return PlanResource::collection($plans);
    }
}
