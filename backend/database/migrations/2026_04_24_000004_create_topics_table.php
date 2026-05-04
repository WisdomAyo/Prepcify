<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            // Materialized path (e.g. 'mechanics/kinematics/projectiles').
            // MySQL: plain BTREE index. Future Postgres migration: add text_pattern_ops.
            $table->string('path');
            $table->unsignedTinyInteger('depth')->default(0);
            $table->text('syllabus_notes')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['exam_subject_id', 'path']);
            $table->index(['exam_subject_id', 'parent_topic_id']);
            $table->unique(['exam_subject_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};
