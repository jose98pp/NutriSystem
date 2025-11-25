<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plan_dias', function (Blueprint $table) {
            // Agregar columnas faltantes
            $table->integer('dia_numero')->default(1)->after('dia_index');
            $table->enum('dia_semana', [
                'LUNES', 
                'MARTES', 
                'MIERCOLES', 
                'JUEVES', 
                'VIERNES', 
                'SABADO', 
                'DOMINGO'
            ])->default('LUNES')->after('dia_numero');
            $table->date('fecha')->nullable()->after('dia_semana');
        });
    }

    public function down(): void
    {
        Schema::table('plan_dias', function (Blueprint $table) {
            $table->dropColumn(['dia_numero', 'dia_semana', 'fecha']);
        });
    }
};
