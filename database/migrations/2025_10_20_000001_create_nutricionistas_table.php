<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutricionistas', function (Blueprint $table) {
            $table->id('id_nutricionista');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('email', 150)->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('especialidad')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutricionistas');
    }
};
