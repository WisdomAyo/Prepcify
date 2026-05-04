<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_missions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mission_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('progress')->default(0);
            $table->unsignedInteger('target');
            $table->timestamp('completed_at')->nullable();
            $table->string('period_key', 30);
            $table->timestamps();

            $table->unique(['user_id', 'mission_id', 'period_key']);
            $table->index(['user_id', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_missions');
    }
};
