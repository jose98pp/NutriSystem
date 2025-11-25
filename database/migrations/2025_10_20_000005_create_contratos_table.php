<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contratos', function (Blueprint $table) {
            $table->id('id_contrato');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_servicio');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->decimal('costo_contratado', 10, 4);
            $table->enum('estado', ['PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO'])->default('PENDIENTE');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onDelete('restrict');
            $table->foreign('id_servicio')->references('id_servicio')->on('servicios')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
