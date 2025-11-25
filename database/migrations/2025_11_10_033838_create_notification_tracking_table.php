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
        Schema::create('notification_tracking', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_evento'); // Ej: 'sesion_proxima_24h', 'comida_programada', 'menu_diario'
            $table->unsignedBigInteger('entidad_id'); // ID de la entidad relacionada (sesion, comida, etc)
            $table->string('entidad_tipo'); // Tipo de entidad: 'sesion', 'comida', 'plan_dia', etc
            $table->unsignedBigInteger('id_usuario'); // Usuario que recibió la notificación
            $table->timestamp('enviada_at'); // Cuándo se envió la notificación
            $table->timestamps();

            // Índice único compuesto para evitar duplicados
            $table->unique(['tipo_evento', 'entidad_id', 'entidad_tipo', 'id_usuario'], 'unique_notification_tracking');
            
            // Índices para búsquedas
            $table->index('id_usuario');
            $table->index(['entidad_id', 'entidad_tipo']);
            $table->index('enviada_at');

            // Foreign key
            $table->foreign('id_usuario')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_tracking');
    }
};
