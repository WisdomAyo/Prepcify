<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // attempts: is_correct filter is used in mastery calculations but lacks an index
        Schema::table('attempts', function (Blueprint $table): void {
            $table->index(['question_id', 'is_correct'], 'attempts_question_correct_idx');
        });

        // questions: filter by exam_subject + status + year (reviewer queue, catalog pages)
        Schema::table('questions', function (Blueprint $table): void {
            $table->index(['exam_subject_id', 'status', 'year'], 'questions_subject_status_year_idx');
            // Vector placeholder for future pgvector migration — stored as JSON for now
            // TODO: replace with VECTOR(1536) column once moving to PostgreSQL + pgvector
            $table->json('embedding')->nullable()->after('explanation');
        });

        // question_drafts: reviewer queue ordered by submitted_at lacks a covering index
        Schema::table('question_drafts', function (Blueprint $table): void {
            $table->index(['status', 'submitted_at'], 'drafts_status_submitted_idx');
        });

        // subscriptions: the active subscription lookup (status + period end) is very hot
        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->index(['user_id', 'status', 'current_period_end'], 'subs_user_status_end_idx');
        });
    }

    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table): void {
            $table->dropIndex('attempts_question_correct_idx');
        });

        Schema::table('questions', function (Blueprint $table): void {
            $table->dropIndex('questions_subject_status_year_idx');
            $table->dropColumn('embedding');
        });

        Schema::table('question_drafts', function (Blueprint $table): void {
            $table->dropIndex('drafts_status_submitted_idx');
        });

        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->dropIndex('subs_user_status_end_idx');
        });
    }
};
