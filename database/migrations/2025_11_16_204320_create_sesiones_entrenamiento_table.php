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
        Schema::create('sesiones_entrenamiento', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rutina_paciente_id');
            $table->unsignedBigInteger('paciente_id');
            $table->date('fecha');
            $table->dateTime('hora_inicio');
            $table->dateTime('hora_fin')->nullable();
            $table->integer('duracion_minutos')->nullable();
            $table->boolean('completada')->default(false);
            $table->integer('porcentaje_completado')->default(0);
            $table->integer('calorias_quemadas')->nullable();
            $table->text('notas')->nullable();
            $table->boolean('sincronizado')->default(true)->comment('Para sincronización offline');
            $table->timestamps();
            
            $table->foreign('rutina_paciente_id')->references('id')->on('rutinas_pacientes')->onDelete('cascade');
            $table->foreign('paciente_id')->references('id_paciente')->on('pacientes')->onDelete('cascade');
            $table->index(['paciente_id', 'fecha']);
            $table->index('completada');
            $table->index('sincronizado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesiones_entrenamiento');
    }
};
