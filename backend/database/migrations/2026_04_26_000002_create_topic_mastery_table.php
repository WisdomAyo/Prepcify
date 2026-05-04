<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topic_mastery', function (Blueprint $table): void {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->decimal('mastery_score', 4, 3)->default(0);
            $table->decimal('confidence', 4, 3)->default(0);
            $table->unsignedInteger('attempts_count')->default(0);
            $table->unsignedInteger('correct_count')->default(0);
            $table->decimal('total_marks_awarded', 8, 2)->default(0);
            $table->decimal('total_marks_available', 8, 2)->default(0);
            $table->timestamp('last_attempted_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->primary(['user_id', 'topic_id']);
            $table->index(['user_id', 'mastery_score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topic_mastery');
    }
};
