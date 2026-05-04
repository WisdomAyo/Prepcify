<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('pending');
            $table->string('invited_by', 20);
            $table->json('permissions')->nullable();
            $table->timestamp('linked_at')->nullable();
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();

            $table->unique(['parent_user_id', 'student_user_id']);
            $table->index(['parent_user_id', 'status']);
            $table->index(['student_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_links');
    }
};
