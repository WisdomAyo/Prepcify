<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use App\Support\Enums\AttemptContext;
use App\Support\Enums\AttemptType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class RecordBatchAttemptsRequest extends FormRequest
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
            'attempts' => ['required', 'array', 'min:1', 'max:100'],
            'attempts.*.question_id' => ['required_without:attempts.*.sub_question_id', 'nullable', 'integer'],
            'attempts.*.sub_question_id' => ['required_without:attempts.*.question_id', 'nullable', 'integer'],
            'attempts.*.attempt_type' => ['required', new Enum(AttemptType::class)],
            'attempts.*.selected_option_id' => ['nullable', 'integer'],
            'attempts.*.response_text' => ['nullable', 'string', 'max:10000'],
            'attempts.*.response_media_url' => ['nullable', 'url', 'max:500'],
            'attempts.*.time_spent_ms' => ['required', 'integer', 'min:0'],
            'attempts.*.context' => ['required', new Enum(AttemptContext::class)],
            'attempts.*.client_uuid' => ['required', 'uuid'],
            'attempts.*.attempted_at' => ['nullable', 'date'],
        ];
    }
}
