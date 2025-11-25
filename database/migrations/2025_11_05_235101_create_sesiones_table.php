<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesiones', function (Blueprint $table) {
            $table->id('id_sesion');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('profesional_id');
            $table->enum('tipo_profesional', ['NUTRICIONISTA', 'PSICOLOGO']);
            $table->enum('tipo_sesion', ['PRESENCIAL', 'VIDEOLLAMADA']);
            $table->dateTime('fecha_hora');
            $table->integer('duracion_minutos')->default(60);
            $table->enum('estado', ['PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'])->default('PROGRAMADA');
            $table->text('motivo')->nullable();
            $table->text('notas')->nullable();
            $table->string('link_videollamada', 500)->nullable();
            $table->timestamps();
            
            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onDelete('cascade');
            $table->index(['fecha_hora', 'estado']);
            $table->index('profesional_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones');
    }
};
