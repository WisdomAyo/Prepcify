<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds nullable `country`, `state`, `city` columns to the users table so the
 * onboarding "About you" step can persist a student's location alongside the
 * existing display_name / phone / avatar fields. All three are optional and
 * indexed only for the country column (where leaderboards/community filters
 * are likely to slice).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('country', 2)->nullable()->after('locale')->index();
            $table->string('state', 100)->nullable()->after('country');
            $table->string('city', 100)->nullable()->after('state');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['country']);
            $table->dropColumn(['country', 'state', 'city']);
        });
    }
};
