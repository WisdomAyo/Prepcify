<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leagues', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->date('period_start');
            $table->date('period_end');
            $table->timestamps();

            $table->index('period_start');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leagues');
    }
};
