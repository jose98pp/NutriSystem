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
        Schema::table('recetas', function (Blueprint $table) {
            $table->boolean('generada_automaticamente')->default(false)->after('restricciones');
            $table->unsignedBigInteger('id_comida_origen')->nullable()->after('generada_automaticamente');
            $table->text('instrucciones_preparacion')->nullable()->after('id_comida_origen');
            $table->integer('tiempo_preparacion_minutos')->nullable()->after('instrucciones_preparacion');
            $table->enum('dificultad', ['facil', 'media', 'dificil'])->default('media')->after('tiempo_preparacion_minutos');
            $table->string('imagen_url')->nullable()->after('dificultad');
            
            // Foreign key para comida origen
            $table->foreign('id_comida_origen')->references('id_comida')->on('comidas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recetas', function (Blueprint $table) {
            $table->dropForeign(['id_comida_origen']);
            $table->dropColumn([
                'generada_automaticamente',
                'id_comida_origen',
                'instrucciones_preparacion',
                'tiempo_preparacion_minutos',
                'dificultad',
                'imagen_url'
            ]);
        });
    }
};
