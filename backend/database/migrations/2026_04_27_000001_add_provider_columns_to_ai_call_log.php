<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_call_log', function (Blueprint $table): void {
            // Which provider actually served this request
            $table->string('provider', 20)->default('claude')->after('error');
            // The provider that failed before this one was tried (null = primary succeeded)
            $table->string('fallback_from', 20)->nullable()->after('provider');

            $table->index(['provider', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('ai_call_log', function (Blueprint $table): void {
            $table->dropIndex(['provider', 'created_at']);
            $table->dropColumn(['provider', 'fallback_from']);
        });
    }
};
