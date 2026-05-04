<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('target_exam_date')->nullable();
            $table->unsignedSmallInteger('target_score')->nullable();
            $table->unsignedSmallInteger('daily_goal_minutes')->nullable();
            $table->string('school', 255)->nullable();
            $table->string('grade_level', 50)->nullable();
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
