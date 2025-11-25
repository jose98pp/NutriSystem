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
        Schema::table('comidas', function (Blueprint $table) {
            $table->tinyInteger('opcion_numero')->default(1)->after('orden');
            $table->boolean('es_alternativa')->default(false)->after('opcion_numero');
            $table->string('nombre_opcion', 50)->nullable()->after('es_alternativa');
            
            // Índice compuesto para búsquedas eficientes
            $table->index(['id_dia', 'tipo_comida', 'opcion_numero'], 'idx_dia_tipo_opcion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comidas', function (Blueprint $table) {
            $table->dropIndex('idx_dia_tipo_opcion');
            $table->dropColumn(['opcion_numero', 'es_alternativa', 'nombre_opcion']);
        });
    }
};
