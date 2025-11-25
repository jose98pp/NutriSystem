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
        Schema::create('progress_photos', function (Blueprint $table) {
            $table->id('id_foto');
            $table->foreignId('id_paciente')->constrained('users')->onDelete('cascade');
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->string('foto_url'); // Ruta de la imagen
            $table->enum('tipo', ['antes', 'durante', 'despues'])->default('durante');
            $table->decimal('peso_kg', 5, 2)->nullable();
            $table->date('fecha');
            $table->timestamps();
            
            $table->index(['id_paciente', 'fecha']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_photos');
    }
};
