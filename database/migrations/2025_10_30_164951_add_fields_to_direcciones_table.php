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
        // Solo ejecutar si la tabla direcciones existe
        if (Schema::hasTable('direcciones')) {
            Schema::table('direcciones', function (Blueprint $table) {
                if (!Schema::hasColumn('direcciones', 'direccion_completa')) {
                    $table->text('direccion_completa')->nullable()->after('descripcion');
                }
                if (!Schema::hasColumn('direcciones', 'ciudad')) {
                    $table->string('ciudad', 100)->nullable()->after('direccion_completa');
                }
                if (!Schema::hasColumn('direcciones', 'codigo_postal')) {
                    $table->string('codigo_postal', 20)->nullable()->after('ciudad');
                }
                if (!Schema::hasColumn('direcciones', 'referencia')) {
                    $table->text('referencia')->nullable()->after('codigo_postal');
                }
                if (!Schema::hasColumn('direcciones', 'es_principal')) {
                    $table->boolean('es_principal')->default(false)->after('referencia');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('direcciones')) {
            Schema::table('direcciones', function (Blueprint $table) {
                $columnsToRemove = [];
                if (Schema::hasColumn('direcciones', 'direccion_completa')) $columnsToRemove[] = 'direccion_completa';
                if (Schema::hasColumn('direcciones', 'ciudad')) $columnsToRemove[] = 'ciudad';
                if (Schema::hasColumn('direcciones', 'codigo_postal')) $columnsToRemove[] = 'codigo_postal';
                if (Schema::hasColumn('direcciones', 'referencia')) $columnsToRemove[] = 'referencia';
                if (Schema::hasColumn('direcciones', 'es_principal')) $columnsToRemove[] = 'es_principal';
                
                if (!empty($columnsToRemove)) {
                    $table->dropColumn($columnsToRemove);
                }
            });
        }
    }
};
