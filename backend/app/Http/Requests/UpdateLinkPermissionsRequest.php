<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLinkPermissionsRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
            'permissions.view_progress' => ['sometimes', 'boolean'],
            'permissions.view_attempts' => ['sometimes', 'boolean'],
            'permissions.receive_reports' => ['sometimes', 'boolean'],
        ];
    }
}
