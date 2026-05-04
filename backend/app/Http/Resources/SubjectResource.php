<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExamSubject;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExamSubject */
class SubjectResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'name' => $this->subject->name,
            'slug' => $this->subject->slug,
            'is_compulsory' => $this->is_compulsory,
            'syllabus_version' => $this->syllabus_version,
            'syllabus_effective_from' => $this->syllabus_effective_from->toDateString(),
            'syllabus_effective_to' => $this->syllabus_effective_to?->toDateString(),
        ];
    }
}
