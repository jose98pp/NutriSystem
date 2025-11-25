<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Nutricionista;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Admin
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@nutricion.com',
            'password' => Hash::make('password123'),
            'role' => 'admin'
        ]);

        // Nutricionistas
        $nutricionista1 = User::create([
            'name' => 'Dr. Carlos Ramírez',
            'email' => 'carlos@nutricion.com',
            'password' => Hash::make('password123'),
            'role' => 'nutricionista'
        ]);

        Nutricionista::create([
            'user_id' => $nutricionista1->id,
            'nombre' => 'Carlos',
            'apellido' => 'Ramírez',
            'email' => 'carlos@nutricion.com',
            'telefono' => '555-1001',
            'especialidad' => 'Nutrición Deportiva'
        ]);

        $nutricionista2 = User::create([
            'name' => 'Dra. María González',
            'email' => 'maria@nutricion.com',
            'password' => Hash::make('password123'),
            'role' => 'nutricionista'
        ]);

        Nutricionista::create([
            'user_id' => $nutricionista2->id,
            'nombre' => 'María',
            'apellido' => 'González',
            'email' => 'maria@nutricion.com',
            'telefono' => '555-1002',
            'especialidad' => 'Nutrición Clínica'
        ]);

        // Pacientes con datos completos
        $pacientes = [
            [
                'name' => 'Juan Pérez',
                'email' => 'juan@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Juan',
                    'apellido' => 'Pérez',
                    'fecha_nacimiento' => '1990-05-15',
                    'genero' => 'M',
                    'email' => 'juan@example.com',
                    'telefono' => '555-0101',
                    'peso_inicial' => 80.0,
                    'estatura' => 1.75,
                    'alergias' => 'Intolerancia a la lactosa',
                    'id_nutricionista' => 1
                ]
            ],
            [
                'name' => 'Ana Martínez',
                'email' => 'ana@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Ana',
                    'apellido' => 'Martínez',
                    'fecha_nacimiento' => '1985-08-22',
                    'genero' => 'F',
                    'email' => 'ana@example.com',
                    'telefono' => '555-0102',
                    'peso_inicial' => 62.0,
                    'estatura' => 1.62,
                    'alergias' => 'Alergia al maní',
                    'id_nutricionista' => 1
                ]
            ],
            [
                'name' => 'Pedro García',
                'email' => 'pedro@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Pedro',
                    'apellido' => 'García',
                    'fecha_nacimiento' => '1995-03-10',
                    'genero' => 'M',
                    'email' => 'pedro@example.com',
                    'telefono' => '555-0103',
                    'peso_inicial' => 90.0,
                    'estatura' => 1.80,
                    'alergias' => 'Ninguna',
                    'id_nutricionista' => 2
                ]
            ],
            [
                'name' => 'Laura Rodríguez',
                'email' => 'laura@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Laura',
                    'apellido' => 'Rodríguez',
                    'fecha_nacimiento' => '1992-11-30',
                    'genero' => 'F',
                    'email' => 'laura@example.com',
                    'telefono' => '555-0104',
                    'peso_inicial' => 68.0,
                    'estatura' => 1.68,
                    'alergias' => 'Hipotiroidismo controlado',
                    'id_nutricionista' => 1
                ]
            ],
            [
                'name' => 'Roberto Fernández',
                'email' => 'roberto@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Roberto',
                    'apellido' => 'Fernández',
                    'fecha_nacimiento' => '1988-07-18',
                    'genero' => 'M',
                    'email' => 'roberto@example.com',
                    'telefono' => '555-0105',
                    'peso_inicial' => 78.0,
                    'estatura' => 1.72,
                    'alergias' => 'Diabetes tipo 2',
                    'id_nutricionista' => 2
                ]
            ],
            [
                'name' => 'Carmen López',
                'email' => 'carmen@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Carmen',
                    'apellido' => 'López',
                    'fecha_nacimiento' => '1998-02-14',
                    'genero' => 'F',
                    'email' => 'carmen@example.com',
                    'telefono' => '555-0106',
                    'peso_inicial' => 58.0,
                    'estatura' => 1.60,
                    'alergias' => 'Alergia al gluten, Celiaquía',
                    'id_nutricionista' => 1
                ]
            ],
            [
                'name' => 'Miguel Torres',
                'email' => 'miguel@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Miguel',
                    'apellido' => 'Torres',
                    'fecha_nacimiento' => '1987-09-25',
                    'genero' => 'M',
                    'email' => 'miguel@example.com',
                    'telefono' => '555-0107',
                    'peso_inicial' => 82.0,
                    'estatura' => 1.77,
                    'alergias' => 'Ninguna',
                    'id_nutricionista' => 2
                ]
            ],
            [
                'name' => 'Sofía Jiménez',
                'email' => 'sofia@example.com',
                'password' => Hash::make('password123'),
                'role' => 'paciente',
                'paciente' => [
                    'nombre' => 'Sofía',
                    'apellido' => 'Jiménez',
                    'fecha_nacimiento' => '1993-12-08',
                    'genero' => 'F',
                    'email' => 'sofia@example.com',
                    'telefono' => '555-0108',
                    'peso_inicial' => 64.0,
                    'estatura' => 1.65,
                    'alergias' => 'Anemia leve',
                    'id_nutricionista' => 1
                ]
            ]
        ];

        foreach ($pacientes as $data) {
            $pacienteData = $data['paciente'];
            unset($data['paciente']);
            
            $user = User::create($data);
            
            Paciente::create([
                'user_id' => $user->id,
                'nombre' => $pacienteData['nombre'],
                'apellido' => $pacienteData['apellido'],
                'fecha_nacimiento' => $pacienteData['fecha_nacimiento'],
                'genero' => $pacienteData['genero'],
                'email' => $pacienteData['email'],
                'telefono' => $pacienteData['telefono'],
                'peso_inicial' => $pacienteData['peso_inicial'],
                'estatura' => $pacienteData['estatura'],
                'alergias' => $pacienteData['alergias'],
                'id_nutricionista' => $pacienteData['id_nutricionista']
            ]);
        }
    }
}
