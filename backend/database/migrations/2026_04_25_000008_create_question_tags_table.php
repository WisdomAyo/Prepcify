<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_tags', function (Blueprint $table): void {
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->string('tag', 50);

            $table->primary(['question_id', 'tag']);
            $table->index('tag');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_tags');
    }
};
