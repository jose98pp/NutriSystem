<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convertir valores antiguos a nuevos
        DB::statement("UPDATE comidas SET tipo_comida = 'DESAYUNO' WHERE tipo_comida = 'desayuno'");
        DB::statement("UPDATE comidas SET tipo_comida = 'ALMUERZO' WHERE tipo_comida = 'almuerzo'");
        DB::statement("UPDATE comidas SET tipo_comida = 'CENA' WHERE tipo_comida = 'cena'");
        DB::statement("UPDATE comidas SET tipo_comida = 'COLACION_MATUTINA' WHERE tipo_comida = 'snack'");
        
        // Solo modificar ENUM en MySQL (SQLite no soporta ENUM ni MODIFY)
        if (DB::getDriverName() !== 'sqlite') {
            // Cambiar temporalmente tipo_comida a VARCHAR para evitar problemas con ENUM
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida VARCHAR(50) NOT NULL");
            
            // Ahora convertir a ENUM con los nuevos valores
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida ENUM('DESAYUNO', 'COLACION_MATUTINA', 'ALMUERZO', 'COLACION_VESPERTINA', 'CENA') NOT NULL");
        }
        
        // Agregar nuevas columnas
        Schema::table('comidas', function (Blueprint $table) {
            $table->time('hora_recomendada')->nullable()->after('tipo_comida');
            $table->string('nombre', 150)->nullable()->after('hora_recomendada');
            $table->text('descripcion')->nullable()->after('nombre');
            $table->text('instrucciones')->nullable()->after('descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('comidas', function (Blueprint $table) {
            $table->dropColumn(['hora_recomendada', 'nombre', 'descripcion', 'instrucciones']);
        });
        
        // Convertir de vuelta a minúsculas
        DB::statement("UPDATE comidas SET tipo_comida = 'desayuno' WHERE tipo_comida = 'DESAYUNO'");
        DB::statement("UPDATE comidas SET tipo_comida = 'almuerzo' WHERE tipo_comida = 'ALMUERZO'");
        DB::statement("UPDATE comidas SET tipo_comida = 'cena' WHERE tipo_comida = 'CENA'");
        DB::statement("UPDATE comidas SET tipo_comida = 'snack' WHERE tipo_comida IN ('COLACION_MATUTINA', 'COLACION_VESPERTINA')");
        
        // Solo modificar ENUM en MySQL (SQLite no soporta ENUM ni MODIFY)
        if (DB::getDriverName() !== 'sqlite') {
            // Cambiar a VARCHAR temporal
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida VARCHAR(50) NOT NULL");
            
            // Convertir de vuelta a ENUM con valores antiguos
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida ENUM('desayuno', 'almuerzo', 'cena', 'snack') NOT NULL");
        }
    }
};
