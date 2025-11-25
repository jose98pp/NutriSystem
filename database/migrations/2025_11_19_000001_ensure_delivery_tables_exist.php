<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
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

            try {
                DB::statement('ALTER TABLE calendario_entrega ADD CONSTRAINT check_fechas_calendario CHECK (fecha_inicio <= fecha_fin)');
            } catch (\Exception $e) {
            }
        }

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

            $indexes = DB::select("SHOW INDEX FROM entrega_programada WHERE Key_name = 'idx_entrega_fecha'");
            if (empty($indexes)) {
                Schema::table('entrega_programada', function (Blueprint $table) {
                    $table->index('fecha', 'idx_entrega_fecha');
                });
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('entrega_programada');
        Schema::dropIfExists('calendario_entrega');
    }
};