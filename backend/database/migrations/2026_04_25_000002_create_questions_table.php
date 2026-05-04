<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('exam_subject_id')->constrained()->restrictOnDelete();
            $table->foreignId('paper_section_id')->nullable()->constrained()->nullOnDelete();
            $table->string('format', 20)->default('mcq');
            $table->string('status', 30)->default('draft');
            $table->text('stem');
            $table->text('explanation')->nullable();
            $table->unsignedInteger('year')->nullable();
            $table->unsignedTinyInteger('marks')->default(1);
            $table->unsignedSmallInteger('sort_order')->default(0);
            // No FK — circular reference avoidance; enforced at app layer
            $table->unsignedBigInteger('correct_option_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['exam_subject_id', 'status']);
            $table->index(['paper_section_id', 'sort_order']);
            $table->index('year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
