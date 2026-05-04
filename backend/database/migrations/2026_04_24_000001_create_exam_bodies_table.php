<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_bodies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            // VARCHAR not ENUM — required for PostgreSQL compatibility
            $table->string('category', 30);
            $table->text('description')->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->string('status', 10)->default('active');
            $table->json('config')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['category', 'status']);
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_bodies');
    }
};
