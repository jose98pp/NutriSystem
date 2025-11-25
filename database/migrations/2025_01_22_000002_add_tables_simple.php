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
        // 1. Tabla de direcciones (depende de pacientes)
        if (Schema::hasTable('pacientes') && !Schema::hasTable('direcciones')) {
            Schema::create('direcciones', function (Blueprint $table) {
                $table->id('id_direccion');
                $table->unsignedBigInteger('id_paciente');
                $table->string('alias', 50);
                $table->text('descripcion')->nullable();
                $table->decimal('geo_lat', 10, 6)->nullable();
                $table->decimal('geo_lng', 10, 6)->nullable();
                $table->timestamps();

                $table->foreign('id_paciente', 'fk_direccion_paciente')
                      ->references('id_paciente')
                      ->on('pacientes')
                      ->onDelete('cascade')
                      ->onUpdate('cascade');
            });
            echo "✓ Tabla direcciones creada\n";
        }

        // 2. Tabla de recetas (independiente)
        if (!Schema::hasTable('recetas')) {
            Schema::create('recetas', function (Blueprint $table) {
                $table->id('id_receta');
                $table->string('nombre', 100);
                $table->integer('kcal')->nullable();
                $table->string('restricciones', 255)->nullable();
                $table->timestamps();

                $table->unique('nombre', 'uk_receta_nombre');
            });
            echo "✓ Tabla recetas creada\n";
        }

        // 3. Tabla de análisis clínicos (independiente)
        if (!Schema::hasTable('analisis_clinicos')) {
            Schema::create('analisis_clinicos', function (Blueprint $table) {
                $table->id('id_analisis');
                $table->string('tipo', 100);
                $table->text('resultado');
                $table->timestamps();
            });
            echo "✓ Tabla analisis_clinicos creada\n";
        }

        // 4. Modificar tabla servicios (solo si existe y no tiene la columna)
        if (Schema::hasTable('servicios') && !Schema::hasColumn('servicios', 'tipo_servicio')) {
            Schema::table('servicios', function (Blueprint $table) {
                $table->string('tipo_servicio', 50)->default('GENERAL')->after('costo');
            });
            echo "✓ Columna tipo_servicio agregada a servicios\n";
        }

        // 5. Tabla de asesoramiento nutricional (depende de servicios)
        if (Schema::hasTable('servicios') && !Schema::hasTable('asesoramiento_nutricional')) {
            Schema::create('asesoramiento_nutricional', function (Blueprint $table) {
                $table->unsignedBigInteger('id_servicio')->primary();
                $table->boolean('control_al_dia_15')->default(true);

                $table->foreign('id_servicio', 'fk_asesoramiento_servicio')
                      ->references('id_servicio')
                      ->on('servicios')
                      ->onDelete('cascade');
            });
            echo "✓ Tabla asesoramiento_nutricional creada\n";
        }

        // 6. Tabla de catering (depende de servicios)
        if (Schema::hasTable('servicios') && !Schema::hasTable('catering')) {
            Schema::create('catering', function (Blueprint $table) {
                $table->unsignedBigInteger('id_servicio')->primary();
                $table->enum('duracion_permitida', ['15_DIAS', '30_DIAS']);
                $table->integer('evaluacion_cada_dias')->default(15);
                $table->boolean('incluye_calendario_entrega');

                $table->foreign('id_servicio', 'fk_catering_servicio')
                      ->references('id_servicio')
                      ->on('servicios')
                      ->onDelete('cascade');
            });
            echo "✓ Tabla catering creada\n";
        }

        // 7. Índices adicionales
        if (Schema::hasTable('pacientes')) {
            $indexes = DB::select("SHOW INDEX FROM pacientes WHERE Key_name = 'idx_paciente_email'");
            if (empty($indexes)) {
                Schema::table('pacientes', function (Blueprint $table) {
                    $table->index('email', 'idx_paciente_email');
                });
                echo "✓ Índice idx_paciente_email creado\n";
            }
        }

        echo "\n📝 Resumen de migraciones:\n";
        echo "- Las tablas que dependen de 'comidas', 'evaluaciones' y 'contratos' no se crearon\n";
        echo "- Estas tablas se crearán automáticamente cuando implementes esas funcionalidades\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catering');
        Schema::dropIfExists('asesoramiento_nutricional');
        
        if (Schema::hasColumn('servicios', 'tipo_servicio')) {
            Schema::table('servicios', function (Blueprint $table) {
                $table->dropColumn('tipo_servicio');
            });
        }

        Schema::dropIfExists('analisis_clinicos');
        Schema::dropIfExists('recetas');
        Schema::dropIfExists('direcciones');
    }
};
