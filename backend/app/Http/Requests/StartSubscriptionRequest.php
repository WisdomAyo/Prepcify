<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StartSubscriptionRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'plan_code' => ['required', 'string', 'exists:plans,code'],
            'currency' => ['required', 'string', 'size:3'],
            'interval' => ['required', Rule::in(['monthly', 'yearly'])],
        ];
    }
}
