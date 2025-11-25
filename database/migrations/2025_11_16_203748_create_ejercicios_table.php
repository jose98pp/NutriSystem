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
        Schema::create('ejercicios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 200);
            $table->text('descripcion');
            $table->text('instrucciones');
            $table->enum('nivel_dificultad', ['principiante', 'intermedio', 'avanzado']);
            $table->enum('tipo_ejercicio', ['fuerza', 'cardio', 'flexibilidad', 'equilibrio']);
            $table->string('equipo_necesario', 255)->nullable();
            $table->integer('calorias_estimadas')->nullable()->comment('Calorías por minuto');
            $table->integer('duracion_estimada')->nullable()->comment('Duración en minutos');
            $table->string('video_url', 500)->nullable();
            $table->string('imagen_principal', 500)->nullable();
            $table->json('imagenes_pasos')->nullable()->comment('Array de URLs de imágenes paso a paso');
            $table->text('advertencias')->nullable();
            $table->json('variaciones')->nullable()->comment('Array de variaciones del ejercicio');
            $table->boolean('activo')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            
            $table->index('nivel_dificultad');
            $table->index('tipo_ejercicio');
            $table->index('activo');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ejercicios');
    }
};
