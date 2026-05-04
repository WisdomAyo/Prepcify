<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_body_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_compulsory')->default(false);
            $table->string('syllabus_version', 20)->default('1.0');
            $table->date('syllabus_effective_from');
            $table->date('syllabus_effective_to')->nullable();
            $table->timestamps();

            $table->unique(['exam_body_id', 'subject_id', 'syllabus_version']);
            $table->index(['exam_body_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_subjects');
    }
};
