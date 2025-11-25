<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id('id_paciente'); // INT UNSIGNED AUTO_INCREMENT
            $table->unsignedBigInteger('user_id'); // Relación con users
            $table->string('nombre', 100)->notNull();
            $table->string('apellido', 100)->notNull();
            $table->date('fecha_nacimiento')->notNull();
            $table->enum('genero', ['M', 'F', 'Otro'])->notNull();
            $table->string('email', 150)->notNull()->unique();
            $table->string('telefono', 20)->nullable();
            $table->decimal('peso_inicial', 5, 2)->nullable();
            $table->decimal('estatura', 4, 2)->nullable(); // Altura en metros
            $table->text('alergias')->nullable();
            $table->unsignedBigInteger('id_nutricionista')->nullable(); // Relación con nutricionistas (BIGINT para coincidir con id_nutricionista)
            $table->timestamps();

            // Claves foráneas
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_nutricionista')->references('id_nutricionista')->on('nutricionistas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};