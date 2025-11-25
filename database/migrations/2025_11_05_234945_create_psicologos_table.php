<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psicologos', function (Blueprint $table) {
            $table->id('id_psicologo');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('cedula_profesional', 50)->unique()->nullable();
            $table->string('especialidad', 100)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('foto_perfil')->nullable();
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->timestamps();
            
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psicologos');
    }
};
