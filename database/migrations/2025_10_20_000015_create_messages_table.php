<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id('id_mensaje');
            $table->foreignId('id_remitente')->constrained('users', 'id')->onDelete('cascade');
            $table->foreignId('id_destinatario')->constrained('users', 'id')->onDelete('cascade');
            $table->text('mensaje');
            $table->boolean('leido')->default(false);
            $table->timestamp('fecha_lectura')->nullable();
            $table->timestamps();
            
            $table->index(['id_remitente', 'id_destinatario']);
            $table->index('leido');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
