<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_sections', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('exam_paper_id')->constrained()->cascadeOnDelete();
            $table->string('title', 100);
            $table->text('instructions')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['exam_paper_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_sections');
    }
};
