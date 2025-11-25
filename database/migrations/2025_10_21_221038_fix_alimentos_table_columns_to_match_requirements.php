<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Esta migración corrige la tabla alimentos para que coincida con el documento de requerimientos.
     * Renombra columnas y ajusta el ENUM de categorías sin perder datos.
     */
    public function up(): void
    {
        // Verificar si las columnas antiguas existen antes de renombrar
        if (Schema::hasColumn('alimentos', 'proteinas_g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->renameColumn('proteinas_g', 'proteinas_por_100g');
            });
        }

        if (Schema::hasColumn('alimentos', 'carbohidratos_g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->renameColumn('carbohidratos_g', 'carbohidratos_por_100g');
            });
        }

        if (Schema::hasColumn('alimentos', 'grasas_g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->renameColumn('grasas_g', 'grasas_por_100g');
            });
        }

        // Eliminar columna fibra_g si existe
        if (Schema::hasColumn('alimentos', 'fibra_g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->dropColumn('fibra_g');
            });
        }

        // Agregar campo restricciones si no existe
        if (!Schema::hasColumn('alimentos', 'restricciones')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->string('restricciones', 255)->nullable()->after('grasas_por_100g');
            });
        }

        // Actualizar valores de categorías para que coincidan con el nuevo ENUM
        // Mapeo de valores antiguos a nuevos (singular)
        DB::statement("UPDATE alimentos SET categoria = 'fruta' WHERE categoria = 'frutas'");
        DB::statement("UPDATE alimentos SET categoria = 'verdura' WHERE categoria = 'verduras'");
        DB::statement("UPDATE alimentos SET categoria = 'cereal' WHERE categoria = 'cereales'");
        DB::statement("UPDATE alimentos SET categoria = 'proteina' WHERE categoria = 'proteinas'");
        DB::statement("UPDATE alimentos SET categoria = 'lacteo' WHERE categoria = 'lacteos'");
        DB::statement("UPDATE alimentos SET categoria = 'grasa' WHERE categoria = 'grasas'");
        
        // Categorías que no están en el nuevo ENUM, convertir a 'otro'
        DB::statement("UPDATE alimentos SET categoria = 'otro' WHERE categoria IN ('legumbres', 'frutos_secos', 'bebidas')");

        // Modificar el ENUM de categorías (solo en MySQL, SQLite no soporta ENUM)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE alimentos MODIFY categoria ENUM('fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro') DEFAULT 'otro'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir cambios en orden inverso
        
        // Restaurar ENUM original (solo en MySQL, SQLite no soporta ENUM)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE alimentos MODIFY categoria ENUM('frutas', 'verduras', 'cereales', 'proteinas', 'lacteos', 'legumbres', 'frutos_secos', 'grasas', 'bebidas', 'otro') DEFAULT 'otro'");
        }

        // Revertir valores de categorías
        DB::statement("UPDATE alimentos SET categoria = 'frutas' WHERE categoria = 'fruta'");
        DB::statement("UPDATE alimentos SET categoria = 'verduras' WHERE categoria = 'verdura'");
        DB::statement("UPDATE alimentos SET categoria = 'cereales' WHERE categoria = 'cereal'");
        DB::statement("UPDATE alimentos SET categoria = 'proteinas' WHERE categoria = 'proteina'");
        DB::statement("UPDATE alimentos SET categoria = 'lacteos' WHERE categoria = 'lacteo'");
        DB::statement("UPDATE alimentos SET categoria = 'grasas' WHERE categoria = 'grasa'");

        // Eliminar campo restricciones
        if (Schema::hasColumn('alimentos', 'restricciones')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->dropColumn('restricciones');
            });
        }

        // Restaurar columna fibra_g
        if (!Schema::hasColumn('alimentos', 'fibra_g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->decimal('fibra_g', 6, 2)->nullable()->after('grasas_g');
            });
        }

        // Renombrar columnas de vuelta
        if (Schema::hasColumn('alimentos', 'proteinas_por_100g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->renameColumn('proteinas_por_100g', 'proteinas_g');
            });
        }

        if (Schema::hasColumn('alimentos', 'carbohidratos_por_100g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->renameColumn('carbohidratos_por_100g', 'carbohidratos_g');
            });
        }

        if (Schema::hasColumn('alimentos', 'grasas_por_100g')) {
            Schema::table('alimentos', function (Blueprint $table) {
                $table->renameColumn('grasas_por_100g', 'grasas_g');
            });
        }
    }
};
