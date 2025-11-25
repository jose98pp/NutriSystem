<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id('id_evaluacion');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->enum('tipo', ['INICIAL', 'PERIODICA', 'FINAL'])->default('PERIODICA');
            $table->date('fecha');
            $table->decimal('peso_kg', 5, 2)->nullable();
            $table->decimal('altura_m', 3, 2)->nullable();
            $table->decimal('circunferencia_cintura_cm', 5, 2)->nullable();
            $table->decimal('circunferencia_cadera_cm', 5, 2)->nullable();
            $table->string('presion_arterial', 20)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onDelete('cascade');
            $table->foreign('id_nutricionista')->references('id')->on('users')->onDelete('cascade');
            $table->index('id_paciente', 'idx_evaluaciones_paciente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones');
    }
};
