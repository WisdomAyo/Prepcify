<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_topics', function (Blueprint $table): void {
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->string('source', 20)->default('manual');
            $table->decimal('confidence', 4, 3)->nullable();
            $table->timestamps();

            $table->primary(['question_id', 'topic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_topics');
    }
};
