<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notificacion');
            $table->foreignId('id_usuario')->constrained('users', 'id')->onDelete('cascade');
            $table->enum('tipo', ['info', 'success', 'warning', 'error']);
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->boolean('leida')->default(false);
            $table->string('link')->nullable();
            $table->timestamps();
            
            $table->index(['id_usuario', 'leida']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
