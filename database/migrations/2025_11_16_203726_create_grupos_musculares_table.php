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
        Schema::create('grupos_musculares', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('nombre_cientifico', 100)->nullable();
            $table->text('descripcion')->nullable();
            $table->enum('zona_corporal', ['superior', 'core', 'inferior']);
            $table->text('svg_path')->comment('Coordenadas SVG para modelo anatómico');
            $table->string('color_hex', 7)->default('#3B82F6');
            $table->integer('orden')->default(0);
            $table->timestamps();
            
            $table->index('zona_corporal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grupos_musculares');
    }
};
