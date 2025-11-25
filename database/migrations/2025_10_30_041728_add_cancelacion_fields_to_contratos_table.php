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
        Schema::table('contratos', function (Blueprint $table) {
            $table->timestamp('fecha_cancelacion')->nullable()->after('observaciones');
            $table->unsignedBigInteger('cancelado_por')->nullable()->after('fecha_cancelacion');
            $table->text('motivo_cancelacion')->nullable()->after('cancelado_por');
            
            $table->foreign('cancelado_por')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contratos', function (Blueprint $table) {
            $table->dropForeign(['cancelado_por']);
            $table->dropColumn(['fecha_cancelacion', 'cancelado_por', 'motivo_cancelacion']);
        });
    }
};
