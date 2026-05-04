<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Partition this table by month (range on attempted_at) once it crosses ~50M rows.
    public function up(): void
    {
        Schema::create('attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('sub_question_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('attempt_type', 20);
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->text('response_text')->nullable();
            $table->string('response_media_url', 500)->nullable();
            $table->decimal('marks_awarded', 5, 2)->nullable();
            $table->decimal('marks_available', 5, 2)->nullable();
            $table->boolean('is_correct')->nullable();
            $table->string('graded_by', 20)->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->json('grading_breakdown')->nullable();
            $table->unsignedInteger('time_spent_ms')->default(0);
            $table->string('context', 30);
            $table->string('client_uuid', 36);
            $table->boolean('requires_regrade')->default(false);
            $table->timestamp('attempted_at');

            $table->index(['user_id', 'attempted_at']);
            $table->index(['user_id', 'question_id']);
            $table->index('question_id');
            $table->index(['context', 'attempted_at']);
            $table->unique(['client_uuid', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempts');
    }
};
