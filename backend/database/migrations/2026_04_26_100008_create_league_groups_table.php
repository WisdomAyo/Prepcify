<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('league_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('tier'); // 1=Bronze ... 6=Master
            $table->timestamps();

            $table->index(['league_id', 'tier']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('league_groups');
    }
};
