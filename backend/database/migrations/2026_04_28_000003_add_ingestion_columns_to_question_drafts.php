<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_drafts', function (Blueprint $table): void {
            $table->foreignId('ingestion_job_id')
                ->nullable()
                ->after('status')
                ->constrained('ingestion_jobs')
                ->nullOnDelete();
            $table->string('source_page_url', 500)->nullable()->after('ingestion_job_id');
            $table->unsignedSmallInteger('source_page_number')->nullable()->after('source_page_url');
            $table->decimal('extraction_confidence', 3, 2)->nullable()->after('source_page_number');
            $table->json('raw_extraction')->nullable()->after('extraction_confidence');

            $table->index('ingestion_job_id');
        });
    }

    public function down(): void
    {
        Schema::table('question_drafts', function (Blueprint $table): void {
            $table->dropForeign(['ingestion_job_id']);
            $table->dropIndex(['ingestion_job_id']);
            $table->dropColumn(['ingestion_job_id', 'source_page_url', 'source_page_number', 'extraction_confidence', 'raw_extraction']);
        });
    }
};
