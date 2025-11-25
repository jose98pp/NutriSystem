<?php

namespace Database\Seeders;

use App\Models\Servicio;
use Illuminate\Database\Seeder;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        $servicios = [
            [
                'nombre' => 'Plan Alimenticio Básico',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 30,
                'costo' => 150.00,
                'descripcion' => 'Plan alimenticio personalizado de 30 días con seguimiento básico.',
            ],
            [
                'nombre' => 'Plan Alimenticio Premium',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 90,
                'costo' => 400.00,
                'descripcion' => 'Plan alimenticio personalizado de 90 días con seguimiento semanal y ajustes.',
            ],
            [
                'nombre' => 'Asesoramiento Nutricional',
                'tipo_servicio' => 'asesoramiento',
                'duracion_dias' => 30,
                'costo' => 80.00,
                'descripcion' => 'Sesiones de asesoramiento nutricional mensuales.',
            ],
            [
                'nombre' => 'Plan Deportivo',
                'tipo_servicio' => 'plan_alimenticio',
                'duracion_dias' => 60,
                'costo' => 280.00,
                'descripcion' => 'Plan alimenticio especializado para deportistas con alta demanda energética.',
            ],
            [
                'nombre' => 'Servicio de Catering Semanal',
                'tipo_servicio' => 'catering',
                'duracion_dias' => 7,
                'costo' => 200.00,
                'descripcion' => 'Comidas preparadas y entregadas semanalmente según plan nutricional.',
            ],
        ];

        foreach ($servicios as $servicio) {
            Servicio::create($servicio);
        }
    }
}
