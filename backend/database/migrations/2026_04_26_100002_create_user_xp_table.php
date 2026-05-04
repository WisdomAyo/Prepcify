<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_xp', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unsignedInteger('total_xp')->default(0);
            $table->unsignedSmallInteger('level')->default(1);
            $table->unsignedSmallInteger('xp_this_week')->default(0);
            $table->date('week_starts_at')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_xp');
    }
};
