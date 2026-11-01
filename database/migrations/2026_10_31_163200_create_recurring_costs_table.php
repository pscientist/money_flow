<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recurring_costs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('amount_cents');
            $table->string('interval');
            $table->date('next_due_on');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_costs');
    }
};
