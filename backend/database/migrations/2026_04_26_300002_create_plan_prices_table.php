<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->char('currency', 3);
            $table->unsignedInteger('amount_minor');
            $table->string('interval', 20);
            $table->string('paystack_plan_code', 100)->nullable();
            $table->timestamps();

            $table->unique(['plan_id', 'currency', 'interval']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_prices');
    }
};
