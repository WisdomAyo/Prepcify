<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StartMockExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function user($guard = null): User
    {
        return parent::user($guard) ?? abort(401);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'exam_body_id' => ['required', 'integer', 'exists:exam_bodies,id'],
            'subject_ids' => ['required', 'array', 'min:1'],
            'subject_ids.*' => ['integer', 'exists:subjects,id'],
        ];
    }
}
