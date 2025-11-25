<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabla de enlace comida_receta (ahora que comidas ya existe)
        if (Schema::hasTable('comidas') && Schema::hasTable('recetas') && !Schema::hasTable('comida_receta')) {
            Schema::create('comida_receta', function (Blueprint $table) {
                $table->id('id_comida_receta');
                $table->unsignedBigInteger('id_comida');
                $table->unsignedBigInteger('id_receta');
                $table->integer('porciones')->default(1);
                $table->timestamps();

                $table->unique(['id_comida', 'id_receta'], 'uk_comida_receta');

                $table->foreign('id_comida', 'fk_comida_receta_comida')
                      ->references('id_comida')
                      ->on('comidas')
                      ->onDelete('cascade');

                $table->foreign('id_receta', 'fk_comida_receta_receta')
                      ->references('id_receta')
                      ->on('recetas')
                      ->onDelete('cascade');
            });
            echo "✓ Tabla comida_receta creada\n";
        }

        // 2. Tabla de enlace evaluacion_analisis_clinico (ahora que evaluaciones ya existe)
        if (Schema::hasTable('evaluaciones') && Schema::hasTable('analisis_clinicos') && !Schema::hasTable('evaluacion_analisis_clinico')) {
            Schema::create('evaluacion_analisis_clinico', function (Blueprint $table) {
                $table->unsignedBigInteger('id_evaluacion');
                $table->unsignedBigInteger('id_analisis');

                $table->primary(['id_evaluacion', 'id_analisis']);

                $table->foreign('id_evaluacion', 'fk_eac_evaluacion')
                      ->references('id_evaluacion')
                      ->on('evaluaciones')
                      ->onDelete('cascade');

                $table->foreign('id_analisis', 'fk_eac_analisis')
                      ->references('id_analisis')
                      ->on('analisis_clinicos')
                      ->onDelete('cascade');
            });
            echo "✓ Tabla evaluacion_analisis_clinico creada\n";
        }

        // 3. Tabla de calendario de entrega (ahora que contratos ya existe)
        if (Schema::hasTable('contratos') && !Schema::hasTable('calendario_entrega')) {
            Schema::create('calendario_entrega', function (Blueprint $table) {
                $table->id('id_calendario');
                $table->unsignedBigInteger('id_contrato');
                $table->date('fecha_inicio');
                $table->date('fecha_fin');
                $table->timestamps();

                $table->unique('id_contrato', 'uk_calendario_contrato');

                $table->foreign('id_contrato', 'fk_calendario_contrato')
                      ->references('id_contrato')
                      ->on('contratos')
                      ->onDelete('cascade');
            });

            // Agregar check constraint para fechas
            try {
                DB::statement('ALTER TABLE calendario_entrega ADD CONSTRAINT check_fechas_calendario CHECK (fecha_inicio <= fecha_fin)');
            } catch (\Exception $e) {
                // La constraint ya existe
            }
            echo "✓ Tabla calendario_entrega creada\n";
        }

        // 4. Tabla de entrega programada (ahora que todas las dependencias existen)
        if (Schema::hasTable('calendario_entrega') && Schema::hasTable('direcciones') && Schema::hasTable('comidas') && !Schema::hasTable('entrega_programada')) {
            Schema::create('entrega_programada', function (Blueprint $table) {
                $table->id('id_entrega');
                $table->unsignedBigInteger('id_calendario');
                $table->unsignedBigInteger('id_direccion');
                $table->unsignedBigInteger('id_comida')->nullable();
                $table->date('fecha');
                $table->enum('estado', ['PROGRAMADA', 'OMITIDA', 'ENTREGADA', 'PENDIENTE']);
                $table->timestamps();

                $table->unique(['id_calendario', 'fecha'], 'uk_entrega_fecha_calendario');

                $table->foreign('id_calendario', 'fk_entrega_calendario')
                      ->references('id_calendario')
                      ->on('calendario_entrega')
                      ->onDelete('cascade');

                $table->foreign('id_direccion', 'fk_entrega_direccion')
                      ->references('id_direccion')
                      ->on('direcciones')
                      ->onDelete('restrict');

                $table->foreign('id_comida', 'fk_entrega_comida')
                      ->references('id_comida')
                      ->on('comidas')
                      ->onDelete('set null');
            });
            echo "✓ Tabla entrega_programada creada\n";
        }

        // 5. Índices adicionales
        if (Schema::hasTable('evaluaciones')) {
            $indexes = DB::select("SHOW INDEX FROM evaluaciones WHERE Key_name = 'idx_evaluacion_paciente_id'");
            if (empty($indexes)) {
                Schema::table('evaluaciones', function (Blueprint $table) {
                    $table->index('id_paciente', 'idx_evaluacion_paciente_id');
                });
                echo "✓ Índice idx_evaluacion_paciente_id creado\n";
            }
        }

        if (Schema::hasTable('entrega_programada')) {
            $indexes = DB::select("SHOW INDEX FROM entrega_programada WHERE Key_name = 'idx_entrega_fecha'");
            if (empty($indexes)) {
                Schema::table('entrega_programada', function (Blueprint $table) {
                    $table->index('fecha', 'idx_entrega_fecha');
                });
                echo "✓ Índice idx_entrega_fecha creado\n";
            }
        }

        // 6. Crear vista para cálculo de nutrición por comida
        DB::statement("DROP VIEW IF EXISTS comida_nutricion");
        
        if (Schema::hasTable('alimento_comida') && Schema::hasTable('alimentos')) {
            DB::statement("
                CREATE VIEW comida_nutricion AS
                SELECT
                    ac.id_comida,
                    SUM(a.calorias_por_100g * ac.cantidad_gramos / 100) AS total_calorias,
                    SUM(a.proteinas_por_100g * ac.cantidad_gramos / 100) AS total_proteinas,
                    SUM(a.carbohidratos_por_100g * ac.cantidad_gramos / 100) AS total_carbohidratos,
                    SUM(a.grasas_por_100g * ac.cantidad_gramos / 100) AS total_grasas
                FROM alimento_comida ac
                JOIN alimentos a ON ac.id_alimento = a.id_alimento
                GROUP BY ac.id_comida
            ");
            echo "✓ Vista comida_nutricion creada\n";
        }

        echo "\n✅ Todas las tablas adicionales fueron creadas exitosamente!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar vista
        DB::statement('DROP VIEW IF EXISTS comida_nutricion');

        // Eliminar índices adicionales
        if (Schema::hasTable('entrega_programada')) {
            Schema::table('entrega_programada', function (Blueprint $table) {
                $indexes = DB::select("SHOW INDEX FROM entrega_programada WHERE Key_name = 'idx_entrega_fecha'");
                if (!empty($indexes)) {
                    $table->dropIndex('idx_entrega_fecha');
                }
            });
        }

        if (Schema::hasTable('evaluaciones')) {
            Schema::table('evaluaciones', function (Blueprint $table) {
                $indexes = DB::select("SHOW INDEX FROM evaluaciones WHERE Key_name = 'idx_evaluacion_paciente_id'");
                if (!empty($indexes)) {
                    $table->dropIndex('idx_evaluacion_paciente_id');
                }
            });
        }

        // Eliminar tablas en orden inverso
        Schema::dropIfExists('entrega_programada');
        Schema::dropIfExists('calendario_entrega');
        Schema::dropIfExists('evaluacion_analisis_clinico');
        Schema::dropIfExists('comida_receta');
    }
};
