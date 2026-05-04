<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingestion_jobs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('exam_paper_id')->constrained()->restrictOnDelete();
            $table->string('pdf_url', 500);
            $table->unsignedBigInteger('pdf_size_bytes')->default(0);
            $table->unsignedSmallInteger('total_pages')->nullable();
            $table->unsignedSmallInteger('pages_processed')->default(0);
            $table->unsignedSmallInteger('pages_failed')->default(0);
            $table->unsignedSmallInteger('questions_extracted')->default(0);
            $table->string('status', 30)->default('queued');
            $table->string('extraction_method', 30)->default('vision_only');
            $table->string('ai_provider_preferred', 20)->default('gemini');
            $table->decimal('estimated_cost_usd', 8, 4)->nullable();
            $table->decimal('actual_cost_usd', 8, 4)->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_summary')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('created_by');
            $table->index('exam_paper_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingestion_jobs');
    }
};
