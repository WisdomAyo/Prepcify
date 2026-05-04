<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_invite_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by_parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('invited_name', 200);
            $table->string('invited_contact', 255);
            $table->string('token', 64)->unique();
            $table->boolean('claimed')->default(false);
            $table->foreignId('claimed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['token', 'claimed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_invite_tokens');
    }
};
