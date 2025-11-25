<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Servicio;
use App\Models\Contrato;
use App\Models\PlanAlimentacion;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UsuarioPruebaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario de prueba
        $user = User::firstOrCreate(
            ['email' => 'paciente@test.com'],
            [
                'name' => 'Paciente Prueba',
                'password' => Hash::make('password123'),
                'telefono' => '+1 234 567 8900',
                'email_verified_at' => now(),
            ]
        );

        // Crear paciente
        $paciente = Paciente::firstOrCreate(
            ['user_id' => $user->id],
            [
                'nombre' => 'Paciente',
                'apellido' => 'Prueba',
                'fecha_nacimiento' => '1990-01-01',
                'genero' => 'M',
                'email' => 'paciente@test.com',
                'telefono' => '+1 234 567 8900',
                'peso_inicial' => 80.00,
                'estatura' => 1.75,
                'alergias' => null,
                'id_nutricionista' => 1,
            ]
        );

        // Buscar o crear un servicio
        $servicio = Servicio::first();
        
        if (!$servicio) {
            $servicio = Servicio::create([
                'nombre' => 'Plan Básico',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 30,
                'costo' => 29.99,
                'descripcion' => 'Plan de alimentación básico',
            ]);
        }

        $this->command->info('✅ Usuario de prueba creado:');
        $this->command->info('📧 Email: paciente@test.com');
        $this->command->info('🔑 Password: password123');
        $this->command->info('');
        $this->command->info('Ahora puedes iniciar sesión en la app móvil con estas credenciales.');
    }
}
