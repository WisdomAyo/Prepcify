<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamBody;
use App\Support\Enums\ExamCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamBody> */
class ExamBodyFactory extends Factory
{
    protected $model = ExamBody::class;

    public function definition(): array
    {
        return [
            'code' => strtolower($this->faker->unique()->lexify('exam_???')),
            'name' => $this->faker->company(),
            'category' => $this->faker->randomElement(ExamCategory::cases())->value,
            'status' => 'active',
            'sort_order' => $this->faker->numberBetween(0, 100),
        ];
    }
}
