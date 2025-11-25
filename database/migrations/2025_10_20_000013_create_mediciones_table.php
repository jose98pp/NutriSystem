<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mediciones', function (Blueprint $table) {
            $table->id('id_medicion');
            $table->unsignedBigInteger('id_evaluacion');
            $table->decimal('peso_kg', 5, 2);
            $table->decimal('altura_m', 4, 2);
            $table->decimal('porc_grasa', 5, 2)->nullable();
            $table->decimal('masa_magra_kg', 5, 2)->nullable();
            $table->decimal('cintura_cm', 5, 2)->nullable();
            $table->decimal('cadera_cm', 5, 2)->nullable();
            $table->decimal('brazo_cm', 5, 2)->nullable();
            $table->decimal('pierna_cm', 5, 2)->nullable();
            $table->timestamps();

            $table->foreign('id_evaluacion')->references('id_evaluacion')->on('evaluaciones')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mediciones');
    }
};
