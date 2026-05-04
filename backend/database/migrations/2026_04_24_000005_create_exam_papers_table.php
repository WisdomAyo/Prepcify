<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_body_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('paper_number')->default(1);
            // VARCHAR not ENUM — required for PostgreSQL compatibility
            $table->string('paper_type', 30);
            $table->string('title');
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->unsignedSmallInteger('total_marks')->nullable();
            $table->text('instructions_general')->nullable();
            $table->string('syllabus_version', 20)->default('1.0');
            $table->timestamps();

            $table->index(['exam_body_id', 'subject_id', 'year']);
            $table->index('paper_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_papers');
    }
};
