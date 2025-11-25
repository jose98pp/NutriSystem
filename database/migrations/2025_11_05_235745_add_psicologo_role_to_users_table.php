<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modificar el enum para agregar 'psicologo' (solo en MySQL, SQLite no soporta ENUM)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'nutricionista', 'paciente', 'psicologo') NOT NULL DEFAULT 'paciente'");
        }
    }

    public function down(): void
    {
        // Volver al enum original (solo en MySQL, SQLite no soporta ENUM)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'nutricionista', 'paciente') NOT NULL DEFAULT 'paciente'");
        }
    }
};
