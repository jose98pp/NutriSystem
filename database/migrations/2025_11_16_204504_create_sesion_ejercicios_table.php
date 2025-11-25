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
        Schema::create('sesion_ejercicios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sesion_entrenamiento_id');
            $table->unsignedBigInteger('ejercicio_id');
            $table->boolean('completado')->default(false);
            $table->integer('series_completadas')->default(0);
            $table->string('repeticiones_realizadas', 50)->nullable();
            $table->decimal('peso_utilizado', 5, 2)->nullable()->comment('Peso en kg si aplica');
            $table->text('notas')->nullable();
            $table->timestamps();
            
            $table->foreign('sesion_entrenamiento_id')->references('id')->on('sesiones_entrenamiento')->onDelete('cascade');
            $table->foreign('ejercicio_id')->references('id')->on('ejercicios')->onDelete('cascade');
            $table->index('sesion_entrenamiento_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesion_ejercicios');
    }
};
