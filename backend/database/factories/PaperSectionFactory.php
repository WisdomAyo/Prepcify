<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExamPaper;
use App\Models\PaperSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PaperSection> */
class PaperSectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_paper_id' => ExamPaper::factory(),
            'title' => $this->faker->words(3, true),
            'instructions' => $this->faker->optional()->sentence(),
            'sort_order' => $this->faker->numberBetween(0, 10),
        ];
    }
}
