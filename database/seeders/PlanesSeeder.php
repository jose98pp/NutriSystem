<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $planes = [
            [
                'nombre' => 'Básico',
                'descripcion' => 'Perfecto para comenzar tu viaje hacia una vida más saludable',
                'precio' => 29.99,
                'caracteristicas' => json_encode([
                    'Plan de alimentación personalizado',
                    'Seguimiento de comidas diarias',
                    'Notificaciones de recordatorio',
                    'Soporte por email',
                    'Acceso a recetas básicas',
                ]),
                'popular' => false,
                'activo' => true,
            ],
            [
                'nombre' => 'Premium',
                'descripcion' => 'El plan más popular con seguimiento profesional',
                'precio' => 49.99,
                'caracteristicas' => json_encode([
                    'Todo lo del plan Básico',
                    '2 sesiones con nutricionista al mes',
                    'Recetas personalizadas ilimitadas',
                    'Análisis nutricional avanzado',
                    'Soporte prioritario por chat',
                    'Seguimiento de progreso detallado',
                ]),
                'popular' => true,
                'activo' => true,
            ],
            [
                'nombre' => 'VIP',
                'descripcion' => 'Experiencia completa con atención personalizada',
                'precio' => 79.99,
                'caracteristicas' => json_encode([
                    'Todo lo del plan Premium',
                    'Sesiones ilimitadas con nutricionista',
                    '2 sesiones con psicólogo al mes',
                    'Entrega de comidas a domicilio',
                    'Plan de ejercicios personalizado',
                    'Soporte 24/7 por WhatsApp',
                    'Videollamadas de seguimiento',
                ]),
                'popular' => false,
                'activo' => true,
            ],
        ];

        foreach ($planes as $plan) {
            Plan::create($plan);
        }
    }
}
