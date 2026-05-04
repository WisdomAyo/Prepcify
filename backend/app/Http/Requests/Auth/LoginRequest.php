<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Normalize: accept either "email" or "phone" field, expose as "identifier"
        if ($this->has('email') && ! $this->has('identifier')) {
            $this->merge(['identifier' => $this->input('email')]);
        } elseif ($this->has('phone') && ! $this->has('identifier')) {
            $this->merge(['identifier' => $this->input('phone')]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }
}
