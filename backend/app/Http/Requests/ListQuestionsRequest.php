<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use App\Support\Enums\QuestionFormat;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class ListQuestionsRequest extends FormRequest
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
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'format' => ['nullable', new Enum(QuestionFormat::class)],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2099'],
            'cursor' => ['nullable', 'string'],
        ];
    }
}
