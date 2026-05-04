<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_diagram_labels', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_diagram_id')->constrained()->cascadeOnDelete();
            $table->string('label', 50);
            $table->decimal('x_pct', 5, 2);
            $table->decimal('y_pct', 5, 2);
            $table->timestamps();

            $table->index('question_diagram_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_diagram_labels');
    }
};
