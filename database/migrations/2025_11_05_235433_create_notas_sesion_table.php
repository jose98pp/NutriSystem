<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas_sesion', function (Blueprint $table) {
            $table->id('id_nota');
            $table->unsignedBigInteger('id_sesion');
            $table->text('contenido');
            $table->enum('tipo', ['OBSERVACION', 'DIAGNOSTICO', 'RECOMENDACION', 'SEGUIMIENTO']);
            $table->boolean('privada')->default(false);
            $table->timestamps();
            
            $table->foreign('id_sesion')->references('id_sesion')->on('sesiones')->onDelete('cascade');
            $table->index('id_sesion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_sesion');
    }
};
