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
        Schema::create('casual_spends', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('amount_cents');
            $table->date('spent_on');
            $table->string('description');
            $table->string('category');
            $table->string('receipt_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('casual_spends');
    }
};
