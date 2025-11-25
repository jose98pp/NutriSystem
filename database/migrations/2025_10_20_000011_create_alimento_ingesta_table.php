<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alimento_ingesta', function (Blueprint $table) {
            $table->id('id_alimento_ingesta');
            $table->unsignedBigInteger('id_ingesta');
            $table->unsignedBigInteger('id_alimento');
            $table->decimal('cantidad_gramos', 6, 2);
            $table->timestamps();

            $table->foreign('id_ingesta')->references('id_ingesta')->on('ingestas')->onDelete('cascade');
            $table->foreign('id_alimento')->references('id_alimento')->on('alimentos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alimento_ingesta');
    }
};
