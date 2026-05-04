<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_streaks', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('current_streak')->default(0);
            $table->unsignedSmallInteger('longest_streak')->default(0);
            $table->date('last_active_date')->nullable();
            $table->unsignedTinyInteger('freezes_available')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_streaks');
    }
};
