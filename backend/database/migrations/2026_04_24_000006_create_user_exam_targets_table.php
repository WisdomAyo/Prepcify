<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_exam_targets', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_body_id')->constrained()->cascadeOnDelete();
            $table->date('target_date');
            $table->unsignedTinyInteger('priority')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['user_id', 'exam_body_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_exam_targets');
    }
};
