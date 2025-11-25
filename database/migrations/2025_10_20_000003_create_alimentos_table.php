<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alimentos', function (Blueprint $table) {
            $table->id('id_alimento');
            $table->string('nombre', 150);
            $table->enum('categoria', ['fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro'])->default('otro');
            $table->decimal('calorias_por_100g', 6, 2)->nullable();
            $table->decimal('proteinas_por_100g', 6, 2)->nullable();
            $table->decimal('carbohidratos_por_100g', 6, 2)->nullable();
            $table->decimal('grasas_por_100g', 6, 2)->nullable();
            $table->string('restricciones', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alimentos');
    }
};
