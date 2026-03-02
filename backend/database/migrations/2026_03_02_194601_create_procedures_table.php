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
        Schema::create('procedures', function (Blueprint $table) {
            $table->id();
            $table->string('speciality');
            $table->string('procedure_name');
            $table->string('level')->nullable();
            $table->string('care_icu')->nullable();
            $table->string('ttg_months')->nullable();
            $table->integer('ttg_days')->nullable();
            $table->integer('ttg_minimum_70_pct')->nullable();
            $table->integer('ttg_alert_90_pct')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procedures');
    }
};
