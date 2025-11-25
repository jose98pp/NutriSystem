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
        Schema::create('rutinas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->enum('nivel_dificultad', ['principiante', 'intermedio', 'avanzado']);
            $table->integer('duracion_estimada')->comment('Duración en minutos');
            $table->integer('frecuencia_semanal')->default(3)->comment('Veces por semana recomendadas');
            $table->string('objetivo', 255)->nullable();
            $table->unsignedBigInteger('tipo_plan_id')->nullable()->comment('Plan de alimentación asociado');
            $table->boolean('es_predeterminada')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            $table->index('nivel_dificultad');
            $table->index('tipo_plan_id');
            $table->index('es_predeterminada');
            $table->foreign('tipo_plan_id')->references('id')->on('planes')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutinas');
    }
};
