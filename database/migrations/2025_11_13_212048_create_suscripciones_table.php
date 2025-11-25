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
        if (!Schema::hasTable('suscripciones')) {
            Schema::create('suscripciones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->unsignedBigInteger('servicio_id');
                $table->foreign('servicio_id')->references('id_servicio')->on('servicios')->onDelete('cascade');
                $table->enum('estado', ['activa', 'cancelada', 'expirada'])->default('activa');
                $table->timestamp('fecha_inicio');
                $table->timestamp('fecha_fin')->nullable();
                $table->timestamp('proximo_cobro')->nullable();
                $table->json('metodo_pago')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripciones');
    }
};
