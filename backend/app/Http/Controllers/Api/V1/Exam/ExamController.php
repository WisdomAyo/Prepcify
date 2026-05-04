<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Exam;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExamBodyResource;
use App\Http\Resources\SubjectResource;
use App\Http\Resources\TopicResource;
use App\Models\ExamBody;
use App\Services\ExamCatalogService;
use App\Support\Enums\ExamCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ExamController extends Controller
{
    public function index(Request $request, ExamCatalogService $service): JsonResponse
    {
        $category = $request->query('category') !== null
            ? ExamCategory::tryFrom((string) $request->query('category'))
            : null;

        $bodies = $service->listExamBodies($category);

        $grouped = $bodies
            ->groupBy(fn (ExamBody $b) => $b->category->value)
            ->map(fn ($group) => ExamBodyResource::collection($group));

        return response()->json(['data' => $grouped]);
    }

    public function subjects(string $code, ExamCatalogService $service): JsonResponse
    {
        $examBody = ExamBody::where('code', $code)->firstOrFail();
        $subjects = $service->listSubjectsForExam($examBody->id);

        return response()->json(['data' => SubjectResource::collection($subjects)]);
    }

    public function topics(string $code, int $subjectId, ExamCatalogService $service): JsonResponse
    {
        $examBody = ExamBody::where('code', $code)->firstOrFail();
        $examSubject = $examBody->examSubjects()->where('subject_id', $subjectId)->firstOrFail();
        $tree = $service->topicTree($examSubject->id);

        return response()->json(['data' => TopicResource::collection($tree)]);
    }
}
