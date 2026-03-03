<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->string('procedure_name');
            $table->string('author', 100);
            $table->text('body');
            $table->timestamps();

            $table->index('procedure_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
