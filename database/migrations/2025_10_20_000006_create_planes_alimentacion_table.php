<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planes_alimentacion', function (Blueprint $table) {
            $table->id('id_plan');
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_nutricionista');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->integer('calorias_objetivo')->default(2000);
            $table->json('distribucion_macros')->nullable();
            $table->json('comidas')->nullable();
            $table->timestamps();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planes_alimentacion');
    }
};
