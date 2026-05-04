<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            // E.164 format: + followed by 7-15 digits
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
        ];
    }
}
