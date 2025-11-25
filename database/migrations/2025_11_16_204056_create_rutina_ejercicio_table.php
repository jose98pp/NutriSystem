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
        Schema::create('rutina_ejercicio', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rutina_id');
            $table->unsignedBigInteger('ejercicio_id');
            $table->integer('orden')->default(0);
            $table->integer('series')->default(3);
            $table->string('repeticiones', 50)->comment('Ej: "12-15" o "30 segundos"');
            $table->integer('descanso_segundos')->default(60);
            $table->text('notas')->nullable();
            $table->timestamps();
            
            $table->foreign('rutina_id')->references('id')->on('rutinas')->onDelete('cascade');
            $table->foreign('ejercicio_id')->references('id')->on('ejercicios')->onDelete('cascade');
            $table->index(['rutina_id', 'orden']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutina_ejercicio');
    }
};
