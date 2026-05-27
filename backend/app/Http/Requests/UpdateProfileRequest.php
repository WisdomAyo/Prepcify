<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Onboarding "About you" — patch the authenticated user's basic profile.
 *
 * Every field is optional so the same request also powers later
 * profile-settings edits. Sanitisation is light because none of these are
 * rendered as HTML in API responses; they round-trip as JSON.
 */
final class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'display_name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'first_name' => ['sometimes', 'nullable', 'string', 'max:80'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:80'],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^\+?[1-9]\d{6,14}$/',
                Rule::unique('users', 'phone')->ignore($userId)->whereNull('deleted_at'),
            ],
            // ISO 3166-1 alpha-2 country code, e.g. "NG", "GB", "US".
            'country' => ['sometimes', 'nullable', 'string', 'size:2', 'alpha'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            // `avatar_url` is set via the dedicated `POST /me/avatar` upload
            // endpoint — clients shouldn't smuggle data-URLs in here. Accept
            // it only as a real http(s) URL (e.g. clearing it back to null).
            'avatar_url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'locale' => ['sometimes', 'string', 'max:10'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid phone number in international format (e.g. +2348012345678).',
            'phone.unique' => 'That phone number is already in use.',
            'country.size' => 'Country must be a two-letter code (e.g. NG, US).',
        ];
    }
}
