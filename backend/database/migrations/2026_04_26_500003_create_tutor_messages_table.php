<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutor_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tutor_session_id')->constrained('tutor_sessions')->cascadeOnDelete();
            $table->string('role', 20);
            $table->text('content');
            $table->unsignedInteger('tokens_used')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['tutor_session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_messages');
    }
};
