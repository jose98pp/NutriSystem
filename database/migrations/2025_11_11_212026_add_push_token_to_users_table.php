<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'push_token')) {
                    $table->string('push_token')->nullable()->after('remember_token');
                }
                if (!Schema::hasColumn('users', 'notification_settings')) {
                    $table->json('notification_settings')->nullable()->after('push_token');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'push_token')) {
                    $table->dropColumn('push_token');
                }
                if (Schema::hasColumn('users', 'notification_settings')) {
                    $table->dropColumn('notification_settings');
                }
            });
        }
    }
};
