<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Multipart file upload for the user's avatar.
 *
 * - Field name: `avatar` (matches the FormData key sent by the frontend).
 * - Accepted MIME types: jpeg, png, webp. GIF deliberately excluded.
 * - Max size: 1.5 MB (1536 KB) — kept tight because avatars render at small
 *   sizes everywhere in the product and the parchment palette doesn't reward
 *   high-DPI photos.
 */
final class UploadAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:1536',
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'avatar.max' => 'Pick an image under 1.5 MB.',
            'avatar.mimes' => 'Use a JPG, PNG, or WebP image.',
            'avatar.image' => 'That file is not an image.',
        ];
    }
}
