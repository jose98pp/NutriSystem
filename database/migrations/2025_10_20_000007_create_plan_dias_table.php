<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_dias', function (Blueprint $table) {
            $table->id('id_dia');
            $table->unsignedBigInteger('id_plan');
            $table->integer('dia_index');
            $table->timestamps();

            $table->unique(['id_plan', 'dia_index'], 'uk_plan_dia');
            $table->foreign('id_plan')->references('id_plan')->on('planes_alimentacion')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_dias');
    }
};
