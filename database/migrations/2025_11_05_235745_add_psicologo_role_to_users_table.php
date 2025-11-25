<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modificar el enum para agregar 'psicologo' según el driver
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'nutricionista', 'paciente', 'psicologo') NOT NULL DEFAULT 'paciente'");
        } elseif ($driver === 'pgsql') {
            // PostgreSQL: Actualizar CHECK constraint
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'nutricionista', 'paciente', 'psicologo'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'paciente'");
        }
    }

    public function down(): void
    {
        // Volver al enum original según el driver
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'nutricionista', 'paciente') NOT NULL DEFAULT 'paciente'");
        } elseif ($driver === 'pgsql') {
            // PostgreSQL: Restaurar CHECK constraint original
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'nutricionista', 'paciente'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'paciente'");
        }
    }
};
