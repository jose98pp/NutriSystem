<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Paciente;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'name' => 'Admin Sistema',
            'email' => 'admin@nutricion.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Nutricionista 1
        $userNutri1 = User::create([
            'name' => 'Dr. Carlos Pérez',
            'email' => 'carlos@nutricion.com',
            'password' => Hash::make('password123'),
            'role' => 'nutricionista',
            'email_verified_at' => now(),
        ]);

        $nutri1 = Nutricionista::create([
            'user_id' => $userNutri1->id,
            'nombre' => 'Carlos',
            'apellido' => 'Pérez',
            'email' => 'carlos@nutricion.com',
            'telefono' => '555-0101',
            'especialidad' => 'Nutrición Deportiva',
        ]);

        // Nutricionista 2
        $userNutri2 = User::create([
            'name' => 'Dra. María González',
            'email' => 'maria@nutricion.com',
            'password' => Hash::make('password123'),
            'role' => 'nutricionista',
            'email_verified_at' => now(),
        ]);

        $nutri2 = Nutricionista::create([
            'user_id' => $userNutri2->id,
            'nombre' => 'María',
            'apellido' => 'González',
            'email' => 'maria@nutricion.com',
            'telefono' => '555-0102',
            'especialidad' => 'Nutrición Clínica',
        ]);

        // Pacientes
        $userPac1 = User::create([
            'name' => 'Juan Rodríguez',
            'email' => 'juan@example.com',
            'password' => Hash::make('password123'),
            'role' => 'paciente',
            'email_verified_at' => now(),
        ]);

        Paciente::create([
            'user_id' => $userPac1->id,
            'nombre' => 'Juan',
            'apellido' => 'Rodríguez',
            'fecha_nacimiento' => '1990-05-15',
            'genero' => 'M',
            'email' => 'juan@example.com',
            'telefono' => '555-1001',
            'peso_inicial' => 85.5,
            'estatura' => 1.75,
            'alergias' => 'Ninguna',
            'id_nutricionista' => $nutri1->id_nutricionista,
        ]);

        $userPac2 = User::create([
            'name' => 'Ana Martínez',
            'email' => 'ana@example.com',
            'password' => Hash::make('password123'),
            'role' => 'paciente',
            'email_verified_at' => now(),
        ]);

        Paciente::create([
            'user_id' => $userPac2->id,
            'nombre' => 'Ana',
            'apellido' => 'Martínez',
            'fecha_nacimiento' => '1985-08-22',
            'genero' => 'F',
            'email' => 'ana@example.com',
            'telefono' => '555-1002',
            'peso_inicial' => 68.0,
            'estatura' => 1.62,
            'alergias' => 'Lactosa',
            'id_nutricionista' => $nutri1->id_nutricionista,
        ]);

        $userPac3 = User::create([
            'name' => 'Luis Torres',
            'email' => 'luis@example.com',
            'password' => Hash::make('password123'),
            'role' => 'paciente',
            'email_verified_at' => now(),
        ]);

        Paciente::create([
            'user_id' => $userPac3->id,
            'nombre' => 'Luis',
            'apellido' => 'Torres',
            'fecha_nacimiento' => '1992-11-10',
            'genero' => 'M',
            'email' => 'luis@example.com',
            'telefono' => '555-1003',
            'peso_inicial' => 92.3,
            'estatura' => 1.80,
            'alergias' => 'Gluten',
            'id_nutricionista' => $nutri2->id_nutricionista,
        ]);
    }
}
