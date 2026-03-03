<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('procedures', function (Blueprint $table) {
            $table->timestamp('icd10_verified_at')->nullable()->after('ttg_alert_90_pct');
            $table->timestamp('icd11_verified_at')->nullable()->after('icd10_verified_at');
            $table->timestamp('mapping_verified_at')->nullable()->after('icd11_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('procedures', function (Blueprint $table) {
            $table->dropColumn(['icd10_verified_at', 'icd11_verified_at', 'mapping_verified_at']);
        });
    }
};
