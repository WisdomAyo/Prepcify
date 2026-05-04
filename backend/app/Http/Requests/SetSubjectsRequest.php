<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetSubjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'selections' => ['required', 'array', 'min:1'],
            'selections.*.exam_body_id' => ['required', 'integer', 'exists:exam_bodies,id'],
            'selections.*.subject_id' => ['required', 'integer', 'exists:subjects,id'],
        ];
    }
}
