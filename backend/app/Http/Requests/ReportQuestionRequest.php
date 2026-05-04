<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use App\Support\Enums\ReportReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class ReportQuestionRequest extends FormRequest
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
            'reason' => ['required', new Enum(ReportReason::class)],
            'detail' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
