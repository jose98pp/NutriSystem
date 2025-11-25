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
        Schema::table('sesiones', function (Blueprint $table) {
            $table->string('zoom_meeting_id', 100)->nullable()->after('link_videollamada');
            $table->string('zoom_meeting_password', 100)->nullable()->after('zoom_meeting_id');
            $table->string('zoom_join_url', 500)->nullable()->after('zoom_meeting_password');
            $table->string('zoom_start_url', 500)->nullable()->after('zoom_join_url');
            $table->timestamp('participante_unido_at')->nullable()->after('zoom_start_url');
            $table->timestamp('finalizada_at')->nullable()->after('participante_unido_at');
            $table->unsignedBigInteger('finalizada_por_user_id')->nullable()->after('finalizada_at');
            
            // Foreign key para usuario que finalizó
            $table->foreign('finalizada_por_user_id')->references('id')->on('users')->onDelete('set null');
            
            // Índice para búsquedas por meeting_id
            $table->index('zoom_meeting_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sesiones', function (Blueprint $table) {
            $table->dropForeign(['finalizada_por_user_id']);
            $table->dropIndex(['zoom_meeting_id']);
            $table->dropColumn([
                'zoom_meeting_id',
                'zoom_meeting_password',
                'zoom_join_url',
                'zoom_start_url',
                'participante_unido_at',
                'finalizada_at',
                'finalizada_por_user_id'
            ]);
        });
    }
};
