<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sub_questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->string('label', 10)->default('a');
            $table->text('stem');
            $table->text('explanation')->nullable();
            $table->unsignedTinyInteger('marks')->default(1);
            $table->unsignedTinyInteger('sort_order')->default(0);
            // No FK — circular reference avoidance; enforced at app layer
            $table->unsignedBigInteger('correct_option_id')->nullable();
            $table->timestamps();

            $table->index(['question_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sub_questions');
    }
};
