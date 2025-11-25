<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingestas', function (Blueprint $table) {
            $table->id('id_ingesta');
            $table->unsignedBigInteger('id_paciente');
            $table->dateTime('fecha_hora');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onDelete('cascade');
            $table->index('fecha_hora', 'idx_ingestas_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingestas');
    }
};
