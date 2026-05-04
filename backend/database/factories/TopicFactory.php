<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamSubject;
use App\Models\Topic;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Topic> */
class TopicFactory extends Factory
{
    protected $model = Topic::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);
        $slug = Str::slug($name);

        return [
            'exam_subject_id' => ExamSubject::factory(),
            'parent_topic_id' => null,
            'name' => ucwords($name),
            'slug' => $slug,
            'path' => $slug,
            'depth' => 0,
            'sort_order' => 0,
        ];
    }
}
