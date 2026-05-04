<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingestion_pages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ingestion_job_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('page_number');
            $table->string('page_image_url', 500);
            $table->string('status', 20)->default('pending');
            $table->string('ai_provider_used', 20)->nullable();
            $table->json('raw_response')->nullable();
            $table->unsignedSmallInteger('questions_extracted')->default(0);
            $table->text('error')->nullable();
            $table->unsignedInteger('processing_duration_ms')->nullable();
            $table->decimal('cost_usd', 8, 6)->nullable();
            $table->timestamps();

            $table->index(['ingestion_job_id', 'status']);
            $table->unique(['ingestion_job_id', 'page_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingestion_pages');
    }
};
