<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('planes_alimentacion', function (Blueprint $table) {
            // Agregar columnas faltantes
            $table->unsignedBigInteger('id_contrato')->nullable()->after('id_plan');
            $table->string('nombre_plan', 150)->nullable()->after('nombre');
            $table->enum('objetivo', [
                'PERDIDA_PESO',
                'GANANCIA_MUSCULAR',
                'MANTENIMIENTO',
                'SALUD_GENERAL',
                'RENDIMIENTO_DEPORTIVO'
            ])->default('MANTENIMIENTO')->after('nombre_plan');
            $table->enum('estado', ['ACTIVO', 'INACTIVO', 'FINALIZADO'])->default('ACTIVO')->after('objetivo');
            $table->integer('duracion_dias')->default(30)->after('fecha_fin');
            
            // Agregar foreign key para contrato
            $table->foreign('id_contrato')->references('id_contrato')->on('contratos')->onDelete('set null');
        });
        
        // Copiar valores de 'nombre' a 'nombre_plan' para datos existentes
        DB::statement('UPDATE planes_alimentacion SET nombre_plan = nombre WHERE nombre_plan IS NULL');
        
        // Ahora hacer nombre_plan NOT NULL
        Schema::table('planes_alimentacion', function (Blueprint $table) {
            $table->string('nombre_plan', 150)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('planes_alimentacion', function (Blueprint $table) {
            $table->dropForeign(['id_contrato']);
            $table->dropColumn(['id_contrato', 'nombre_plan', 'objetivo', 'estado', 'duracion_dias']);
        });
    }
};
