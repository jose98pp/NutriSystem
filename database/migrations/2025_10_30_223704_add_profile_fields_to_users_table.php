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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'foto_perfil')) {
                $table->string('foto_perfil')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'telefono')) {
                $table->string('telefono', 20)->nullable()->after('foto_perfil');
            }
            if (!Schema::hasColumn('users', 'fecha_nacimiento')) {
                $table->date('fecha_nacimiento')->nullable()->after('telefono');
            }
            if (!Schema::hasColumn('users', 'preferences')) {
                $table->json('preferences')->nullable()->after('fecha_nacimiento');
            }
            if (!Schema::hasColumn('users', 'notification_settings')) {
                $table->json('notification_settings')->nullable()->after('preferences');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['foto_perfil', 'telefono', 'fecha_nacimiento', 'preferences', 'notification_settings']);
        });
    }
};
