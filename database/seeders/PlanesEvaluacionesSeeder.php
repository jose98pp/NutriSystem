<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PlanAlimentacion;
use App\Models\Evaluacion;
use App\Models\Ingesta;
use App\Models\Alimento;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;

class PlanesEvaluacionesSeeder extends Seeder
{
    // Constantes para tipos de comida
    private const TIPO_COMIDA = [
        'DESAYUNO' => 'desayuno',
        'MEDIA_MANANA' => 'media_manana',
        'ALMUERZO' => 'almuerzo',
        'MERIENDA' => 'merienda',
        'CENA' => 'cena',
        'OTRO' => 'otro'
    ];

    // Constantes para niveles de actividad
    private const NIVEL_ACTIVIDAD = [
        'BAJO' => 'bajo',
        'MODERADO' => 'moderado',
        'ALTO' => 'alto'
    ];

    // Constantes para rangos de valores
    private const RANGOS = [
        'PESO' => ['min' => 30, 'max' => 200],
        'ALTURA' => ['min' => 1.40, 'max' => 2.20],
        'CINTURA' => ['min' => 50, 'max' => 150],
        'CADERA' => ['min' => 70, 'max' => 160],
        'CALORIAS' => ['min' => 1200, 'max' => 3500]
    ];

    public function run()
    {
        $pacientes = User::where('role', 'paciente')->get();
        $nutricionista = User::where('email', 'carlos@nutricion.com')->first();
        
        if (!$nutricionista) {
            throw new InvalidArgumentException('El nutricionista carlos@nutricion.com no existe en la base de datos.');
        }

        $alimentos = Alimento::all();
        
        if ($alimentos->isEmpty()) {
            throw new InvalidArgumentException('No hay alimentos en la base de datos.');
        }

        foreach ($pacientes as $paciente) {
            // Crear evaluaciones (historial de 6 meses)
            $this->crearEvaluaciones($paciente);

            // Crear plan de alimentación activo
            $plan = $this->crearPlanAlimentacion($paciente, $nutricionista);

            // Crear ingestas de las últimas 2 semanas
            if ($plan) {
                $this->crearIngestas($paciente, $alimentos);
            }
        }
    }

    private function validarDatosEvaluacion($datos)
    {
        $validator = Validator::make($datos, [
            'peso_kg' => 'required|numeric|between:' . self::RANGOS['PESO']['min'] . ',' . self::RANGOS['PESO']['max'],
            'altura_m' => 'required|numeric|between:' . self::RANGOS['ALTURA']['min'] . ',' . self::RANGOS['ALTURA']['max'],
            'circunferencia_cintura_cm' => 'required|numeric|between:' . self::RANGOS['CINTURA']['min'] . ',' . self::RANGOS['CINTURA']['max'],
            'circunferencia_cadera_cm' => 'required|numeric|between:' . self::RANGOS['CADERA']['min'] . ',' . self::RANGOS['CADERA']['max'],
            'presion_arterial' => 'required|string|regex:/^\d{2,3}\/\d{2,3}$/',
        ]);

        if ($validator->fails()) {
            throw new InvalidArgumentException('Datos de evaluación inválidos: ' . json_encode($validator->errors()));
        }
    }

    private function crearEvaluaciones($paciente)
    {
        if (!$paciente->paciente) {
            throw new InvalidArgumentException("El usuario no tiene datos de paciente asociados.");
        }

        $pacienteData = $paciente->paciente;
        $pesoInicial = $pacienteData->peso_objetivo_kg + rand(5, 20); // Peso mayor al objetivo
        
        // 6 evaluaciones en los últimos 6 meses
        for ($i = 5; $i >= 0; $i--) {
            $fecha = Carbon::now()->subMonths($i);
            $progreso = (5 - $i) * 0.5; // Pérdida progresiva
            $pesoActual = max($pesoInicial - $progreso, $pacienteData->peso_objetivo_kg);
            
            Evaluacion::create([
                'id_paciente' => $paciente->id,
                'id_nutricionista' => 2, // Dr. Carlos
                'fecha' => $fecha,
                'peso_kg' => round($pesoActual, 1),
                'altura_m' => $pacienteData->altura_m,
                'circunferencia_cintura_cm' => rand(70, 100),
                'circunferencia_cadera_cm' => rand(90, 110),
                'presion_arterial' => rand(110, 130) . '/' . rand(70, 85),
                'observaciones' => $this->generarObservacion($i, $progreso)
            ]);
        }
    }

    private function generarObservacion($mes, $progreso)
    {
        $observaciones = [
            'Excelente progreso, mantener rutina actual',
            'Buen avance en la pérdida de peso, continuar con el plan',
            'Se observa adherencia al plan nutricional',
            'Mejora en composición corporal',
            'Pérdida de peso saludable y sostenible',
            'Resultados satisfactorios, continuar con actividad física',
            'Parámetros dentro de rangos saludables'
        ];

        if ($progreso < 1) {
            return 'Evaluación inicial. Iniciando plan nutricional personalizado.';
        }

        return $observaciones[array_rand($observaciones)];
    }

    private function validarDatosPlan($datos)
    {
        $validator = Validator::make($datos, [
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'id_nutricionista' => 'required|exists:users,id',
            'nombre' => 'required|string|max:150',
            'calorias_objetivo' => 'required|integer|between:' . self::RANGOS['CALORIAS']['min'] . ',' . self::RANGOS['CALORIAS']['max'],
            'distribucion_macros' => 'required|json',
            'comidas' => 'required|json'
        ]);

        if ($validator->fails()) {
            throw new InvalidArgumentException('Datos del plan inválidos: ' . json_encode($validator->errors()));
        }
    }

    private function crearPlanAlimentacion($paciente, $nutricionista)
    {
        if (!$paciente->paciente) {
            throw new InvalidArgumentException("El usuario no tiene datos de paciente asociados.");
        }

        $pacienteData = $paciente->paciente;
        
        // Calcular calorías según objetivo y actividad
        $calorias = match($pacienteData->nivel_actividad) {
            self::NIVEL_ACTIVIDAD['BAJO'] => 1600,
            self::NIVEL_ACTIVIDAD['MODERADO'] => 2000,
            self::NIVEL_ACTIVIDAD['ALTO'] => 2400,
            default => 1800
        };

        // Si es ganancia muscular, aumentar calorías
        if (str_contains(strtolower($pacienteData->objetivo_nutricional), 'ganancia') ||
            str_contains(strtolower($pacienteData->objetivo_nutricional), 'muscular')) {
            $calorias += 400;
        }

        $plan = PlanAlimentacion::create([
            'id_paciente' => $paciente->id,
            'id_nutricionista' => $nutricionista->id,
            'nombre' => 'Plan ' . $paciente->name . ' - ' . date('Y'),
            'descripcion' => 'Plan nutricional personalizado basado en: ' . $pacienteData->objetivo_nutricional,
            'fecha_inicio' => Carbon::now()->subMonths(2),
            'fecha_fin' => Carbon::now()->addMonths(4),
            'calorias_objetivo' => $calorias,
            'distribucion_macros' => json_encode([
                'proteinas' => 30,
                'carbohidratos' => 45,
                'grasas' => 25
            ]),
            'comidas' => json_encode($this->generarComidas($pacienteData, $calorias))
        ]);

        return $plan;
    }

    private function generarComidas($pacienteData, $caloriasTotales)
    {
        $alergias = strtolower($pacienteData->alergias_alimentarias ?? '');
        $esVegetariano = str_contains(strtolower($pacienteData->objetivo_nutricional), 'vegetariana');
        $esCeliaco = str_contains($alergias, 'gluten') || str_contains($alergias, 'celiaquía');
        $sinLactosa = str_contains($alergias, 'lactosa');

        return [
            [
                'tipo' => 'Desayuno',
                'hora' => '08:00',
                'alimentos' => $this->obtenerDesayuno($esCeliaco, $sinLactosa),
                'calorias' => round($caloriasTotales * 0.25)
            ],
            [
                'tipo' => 'Media Mañana',
                'hora' => '11:00',
                'alimentos' => ['Manzana (1 unidad)', 'Almendras (30g)'],
                'calorias' => round($caloriasTotales * 0.10)
            ],
            [
                'tipo' => 'Almuerzo',
                'hora' => '14:00',
                'alimentos' => $this->obtenerAlmuerzo($esVegetariano, $esCeliaco),
                'calorias' => round($caloriasTotales * 0.35)
            ],
            [
                'tipo' => 'Merienda',
                'hora' => '17:00',
                'alimentos' => $sinLactosa ? ['Té verde', 'Fresas (150g)'] : ['Yogur griego (150g)', 'Frutos rojos (100g)'],
                'calorias' => round($caloriasTotales * 0.10)
            ],
            [
                'tipo' => 'Cena',
                'hora' => '20:00',
                'alimentos' => $this->obtenerCena($esVegetariano, $esCeliaco),
                'calorias' => round($caloriasTotales * 0.20)
            ]
        ];
    }

    private function obtenerDesayuno($esCeliaco, $sinLactosa)
    {
        if ($esCeliaco && $sinLactosa) {
            return ['Avena con leche de almendras (250ml)', 'Plátano (1 unidad)', 'Nueces (30g)'];
        } elseif ($esCeliaco) {
            return ['Yogur natural (200g)', 'Granola sin gluten (50g)', 'Fresas (100g)'];
        } elseif ($sinLactosa) {
            return ['Pan integral (2 rebanadas)', 'Aguacate (1/2 unidad)', 'Huevo cocido (2 unidades)'];
        }
        
        return ['Avena (60g)', 'Leche descremada (250ml)', 'Plátano (1 unidad)', 'Almendras (20g)'];
    }

    private function obtenerAlmuerzo($esVegetariano, $esCeliaco)
    {
        if ($esVegetariano) {
            $base = ['Ensalada verde mixta', 'Garbanzos (150g)', 'Quinoa (100g)', 'Aguacate (1/2 unidad)'];
        } else {
            $proteinas = ['Pechuga de pollo (150g)', 'Salmón (150g)', 'Atún (150g)'];
            $base = [
                $proteinas[array_rand($proteinas)],
                'Ensalada verde',
                $esCeliaco ? 'Arroz integral (100g)' : 'Pan integral (1 rebanada)',
                'Brócoli al vapor (150g)'
            ];
        }
        
        return $base;
    }

    private function obtenerCena($esVegetariano, $esCeliaco)
    {
        if ($esVegetariano) {
            return ['Tofu a la plancha (150g)', 'Ensalada de espinacas', 'Batata asada (100g)'];
        }
        
        return [
            'Pechuga de pavo (120g)',
            'Verduras salteadas (200g)',
            'Papa al horno (100g)',
            'Té verde'
        ];
    }

    private function validarDatosIngesta($datos)
    {
        $validator = Validator::make($datos, [
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'fecha' => 'required|date',
            'tipo_comida' => 'required|in:' . implode(',', self::TIPO_COMIDA),
            'alimentos' => 'required|json',
            'calorias_totales' => 'required|numeric|between:0,5000'
        ]);

        if ($validator->fails()) {
            throw new InvalidArgumentException('Datos de ingesta inválidos: ' . json_encode($validator->errors()));
        }
    }

    private function crearIngestas($paciente, $alimentos)
    {
        if (!$paciente || !$alimentos->count()) {
            throw new InvalidArgumentException("Paciente o alimentos no válidos");
        }

        // Crear ingestas de los últimos 14 días
        for ($i = 13; $i >= 0; $i--) {
            $fecha = Carbon::now()->subDays($i);
            
            // 2-3 ingestas por día
            $numIngestas = rand(2, 3);
            
            for ($j = 0; $j < $numIngestas; $j++) {
                $tipoComida = [
                self::TIPO_COMIDA['DESAYUNO'],
                self::TIPO_COMIDA['ALMUERZO'],
                self::TIPO_COMIDA['CENA']
            ][$j];
                $alimentosIngesta = $alimentos->random(rand(3, 5));
                
                $caloriasTotal = 0;
                $alimentosArray = [];
                
                foreach ($alimentosIngesta as $alimento) {
                    $cantidad = rand(50, 200);
                    $calorias = ($alimento->calorias_por_100g * $cantidad) / 100;
                    $caloriasTotal += $calorias;
                    
                    $alimentosArray[] = [
                        'nombre' => $alimento->nombre,
                        'cantidad' => $cantidad,
                        'unidad' => 'g',
                        'calorias' => round($calorias, 1)
                    ];
                }

                Ingesta::create([
                    'id_paciente' => $paciente->id,
                    'fecha' => $fecha,
                    'tipo_comida' => $tipoComida,
                    'alimentos' => json_encode($alimentosArray),
                    'calorias_totales' => round($caloriasTotal, 1),
                    'observaciones' => rand(0, 1) ? null : 'Me sentí satisfecho, buena comida'
                ]);
            }
        }
    }
}
