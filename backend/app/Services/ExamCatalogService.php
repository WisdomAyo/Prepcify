<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExamBody;
use App\Models\ExamSubject;
use App\Models\Topic;
use App\Support\Enums\ExamCategory;
use Illuminate\Database\Eloquent\Collection;

class ExamCatalogService
{
    /**
     * @return Collection<int, ExamBody>
     */
    public function listExamBodies(?ExamCategory $category = null): Collection
    {
        $query = ExamBody::active()->orderBy('sort_order')->orderBy('name');

        if ($category !== null) {
            $query->byCategory($category);
        }

        return $query->get();
    }

    /**
     * @return Collection<int, ExamSubject>
     */
    public function listSubjectsForExam(int $examBodyId): Collection
    {
        return ExamSubject::with('subject')
            ->where('exam_body_id', $examBodyId)
            ->orderBy('is_compulsory', 'desc')
            ->get();
    }

    /**
     * @return Collection<int, Topic>
     */
    public function listTopics(int $examSubjectId, ?int $parentId = null): Collection
    {
        return Topic::forExamSubject($examSubjectId)
            ->where('parent_topic_id', $parentId)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Returns a nested topic tree for an exam subject.
     * Loads all topics in two queries then assembles in memory.
     *
     * @return Collection<int, Topic>
     */
    public function topicTree(int $examSubjectId): Collection
    {
        $all = Topic::forExamSubject($examSubjectId)
            ->orderBy('depth')
            ->orderBy('sort_order')
            ->get()
            ->keyBy('id');

        // Attach children collections to each topic
        $all->each(function (Topic $topic): void {
            $topic->setRelation('children', new Collection);
        });

        $roots = new Collection;

        $all->each(function (Topic $topic) use ($all, $roots): void {
            if ($topic->parent_topic_id === null) {
                $roots->push($topic);
            } else {
                $parent = $all->get($topic->parent_topic_id);
                if ($parent instanceof Topic) {
                    $parent->children->push($topic);
                }
            }
        });

        return $roots;
    }
}
