<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_options', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('sub_question_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('label', 5);
            $table->text('body');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['question_id', 'sort_order']);
            $table->index(['sub_question_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};
