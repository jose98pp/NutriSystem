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
        Schema::create('user_presence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['online', 'offline', 'away'])->default('offline');
            $table->timestamp('last_seen_at')->nullable();
            $table->string('socket_id')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });

        // Tabla para tracking de "escribiendo..." - solo si existe tabla conversaciones
        if (Schema::hasTable('conversaciones')) {
            Schema::create('typing_indicators', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->unsignedBigInteger('conversacion_id');
                $table->foreign('conversacion_id')->references('id')->on('conversaciones')->onDelete('cascade');
                $table->timestamp('started_at');
                $table->timestamps();

                $table->index(['conversacion_id', 'user_id']);
            });
        } else {
            // Crear sin foreign key si no existe conversaciones
            Schema::create('typing_indicators', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->unsignedBigInteger('conversacion_id');
                $table->timestamp('started_at');
                $table->timestamps();

                $table->index(['conversacion_id', 'user_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('typing_indicators');
        Schema::dropIfExists('user_presence');
    }
};
