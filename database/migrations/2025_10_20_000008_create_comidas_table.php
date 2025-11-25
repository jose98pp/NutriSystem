<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comidas', function (Blueprint $table) {
            $table->id('id_comida');
            $table->unsignedBigInteger('id_dia');
            $table->enum('tipo_comida', ['desayuno', 'almuerzo', 'cena', 'snack']);
            $table->integer('orden');
            $table->timestamps();

            $table->unique(['id_dia', 'tipo_comida'], 'uk_comida_dia');
            $table->foreign('id_dia')->references('id_dia')->on('plan_dias')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comidas');
    }
};
