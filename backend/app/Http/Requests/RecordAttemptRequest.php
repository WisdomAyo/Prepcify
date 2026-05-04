<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use App\Support\Enums\AttemptContext;
use App\Support\Enums\AttemptType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class RecordAttemptRequest extends FormRequest
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
            'question_id' => ['required_without:sub_question_id', 'nullable', 'integer', 'exists:questions,id'],
            'sub_question_id' => ['required_without:question_id', 'nullable', 'integer', 'exists:sub_questions,id'],
            'attempt_type' => ['required', new Enum(AttemptType::class)],
            'selected_option_id' => ['nullable', 'integer', 'exists:question_options,id'],
            'response_text' => ['nullable', 'string', 'max:10000'],
            'response_media_url' => ['nullable', 'url', 'max:500'],
            'time_spent_ms' => ['required', 'integer', 'min:0'],
            'context' => ['required', new Enum(AttemptContext::class)],
            'client_uuid' => ['required', 'uuid'],
            'attempted_at' => ['nullable', 'date'],
        ];
    }
}
