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
        Schema::table('progress_photos', function (Blueprint $table) {
            // Eliminar la foreign key actual
            $table->dropForeign(['id_paciente']);
            
            // Cambiar la foreign key para que apunte a pacientes.id_paciente
            $table->foreign('id_paciente')
                  ->references('id_paciente')
                  ->on('pacientes')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progress_photos', function (Blueprint $table) {
            // Revertir al estado anterior
            $table->dropForeign(['id_paciente']);
            
            $table->foreign('id_paciente')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }
};
