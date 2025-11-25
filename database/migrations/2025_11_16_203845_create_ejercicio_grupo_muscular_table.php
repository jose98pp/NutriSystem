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
        Schema::create('ejercicio_grupo_muscular', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ejercicio_id');
            $table->unsignedBigInteger('grupo_muscular_id');
            $table->boolean('es_principal')->default(false)->comment('Si es el grupo muscular principal trabajado');
            $table->timestamps();
            
            $table->foreign('ejercicio_id')->references('id')->on('ejercicios')->onDelete('cascade');
            $table->foreign('grupo_muscular_id')->references('id')->on('grupos_musculares')->onDelete('cascade');
            $table->unique(['ejercicio_id', 'grupo_muscular_id'], 'unique_ejercicio_grupo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ejercicio_grupo_muscular');
    }
};
