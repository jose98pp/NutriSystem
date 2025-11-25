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
        
        // Modificar ENUM según el driver de base de datos
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql') {
            // MySQL: Cambiar temporalmente a VARCHAR y luego a ENUM
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida VARCHAR(50) NOT NULL");
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida ENUM('DESAYUNO', 'COLACION_MATUTINA', 'ALMUERZO', 'COLACION_VESPERTINA', 'CENA') NOT NULL");
        } elseif ($driver === 'pgsql') {
            // PostgreSQL: Usar CHECK constraint
            DB::statement("ALTER TABLE comidas DROP CONSTRAINT IF EXISTS comidas_tipo_comida_check");
            DB::statement("ALTER TABLE comidas ADD CONSTRAINT comidas_tipo_comida_check CHECK (tipo_comida IN ('DESAYUNO', 'COLACION_MATUTINA', 'ALMUERZO', 'COLACION_VESPERTINA', 'CENA'))");
        }
        // SQLite no necesita cambios
        
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
        
        // Modificar ENUM según el driver de base de datos
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql') {
            // MySQL: Cambiar a VARCHAR temporal y luego a ENUM original
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida VARCHAR(50) NOT NULL");
            DB::statement("ALTER TABLE comidas MODIFY tipo_comida ENUM('desayuno', 'almuerzo', 'cena', 'snack') NOT NULL");
        } elseif ($driver === 'pgsql') {
            // PostgreSQL: Restaurar CHECK constraint original
            DB::statement("ALTER TABLE comidas DROP CONSTRAINT IF EXISTS comidas_tipo_comida_check");
            DB::statement("ALTER TABLE comidas ADD CONSTRAINT comidas_tipo_comida_check CHECK (tipo_comida IN ('desayuno', 'almuerzo', 'cena', 'snack'))");
        }
    }
};
