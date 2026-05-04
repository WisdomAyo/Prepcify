<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // question_attempts table arrives in Milestone 4 — no-op if not yet present
        if (! Schema::hasTable('question_attempts')) {
            return;
        }

        Schema::table('question_attempts', function (Blueprint $table): void {
            $table->boolean('requires_regrade')->default(false)->after('is_correct');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('question_attempts')) {
            return;
        }

        Schema::table('question_attempts', function (Blueprint $table): void {
            $table->dropColumn('requires_regrade');
        });
    }
};
