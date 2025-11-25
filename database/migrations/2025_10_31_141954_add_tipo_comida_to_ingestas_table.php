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
        Schema::table('ingestas', function (Blueprint $table) {
            $table->enum('tipo_comida', [
                'DESAYUNO', 
                'COLACION_MATUTINA', 
                'ALMUERZO', 
                'COLACION_VESPERTINA', 
                'CENA',
                'SNACK',
                'COMIDA'
            ])->nullable()->after('id_paciente');
            $table->index('tipo_comida', 'idx_ingestas_tipo_comida');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingestas', function (Blueprint $table) {
            $table->dropIndex('idx_ingestas_tipo_comida');
            $table->dropColumn('tipo_comida');
        });
    }
};
