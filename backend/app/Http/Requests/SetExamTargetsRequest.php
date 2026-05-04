<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetExamTargetsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'exam_body_ids' => ['required', 'array', 'min:1'],
            'exam_body_ids.*' => ['required', 'integer', 'exists:exam_bodies,id'],
            'target_date' => ['required', 'date', 'after:today'],
        ];
    }
}
