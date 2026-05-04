<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mock_exams', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_body_id')->constrained()->restrictOnDelete();
            $table->json('subject_ids');
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('total_score', 8, 2)->nullable();
            $table->decimal('max_score', 8, 2)->nullable();
            $table->decimal('percentile', 5, 2)->nullable();
            $table->json('breakdown')->nullable();
            $table->string('status', 20)->default('in_progress');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['exam_body_id', 'submitted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mock_exams');
    }
};
