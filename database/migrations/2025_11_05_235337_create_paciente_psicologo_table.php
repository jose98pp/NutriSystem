<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paciente_psicologo', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_psicologo');
            $table->date('fecha_asignacion');
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->text('notas')->nullable();
            $table->timestamps();
            
            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onDelete('cascade');
            $table->foreign('id_psicologo')->references('id_psicologo')->on('psicologos')->onDelete('cascade');
            $table->unique(['id_paciente', 'id_psicologo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paciente_psicologo');
    }
};
