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
        Schema::create('rutinas_pacientes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('paciente_id');
            $table->unsignedBigInteger('rutina_id');
            $table->unsignedBigInteger('plan_alimentacion_id')->nullable()->comment('Plan asociado');
            $table->unsignedBigInteger('asignado_por');
            $table->date('fecha_asignacion');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->json('dias_semana')->nullable()->comment('Array de días: [1,3,5] = Lun, Mie, Vie');
            $table->time('hora_recordatorio')->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();
            
            $table->foreign('paciente_id')->references('id_paciente')->on('pacientes')->onDelete('cascade');
            $table->foreign('rutina_id')->references('id')->on('rutinas')->onDelete('cascade');
            $table->foreign('plan_alimentacion_id')->references('id_plan')->on('planes_alimentacion')->onDelete('set null');
            $table->foreign('asignado_por')->references('id')->on('users')->onDelete('cascade');
            $table->index(['paciente_id', 'activa']);
            $table->index('plan_alimentacion_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutinas_pacientes');
    }
};
