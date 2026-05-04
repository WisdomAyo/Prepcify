<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_league_standings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('league_group_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('xp_in_period')->default(0);
            $table->unsignedSmallInteger('rank')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'league_group_id']);
            $table->index(['league_group_id', 'xp_in_period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_league_standings');
    }
};
