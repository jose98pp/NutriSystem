<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlanAlimentacion;
use App\Models\Comida;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MenuSemanalController extends Controller
{
    /**
     * Obtener el menú semanal del paciente autenticado
     */
    public function getMiMenuSemanal(Request $request)
    {
        try {
            $user = $request->user();
            
            // Obtener el paciente del usuario
            $paciente = $user->paciente;
            if (!$paciente) {
                $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            }
            
            if (!$paciente) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró información de paciente'
                ], 404);
            }
        
        // Obtener fecha de inicio de la semana
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfWeek()->format('Y-m-d'));
        $fechaInicioCarbon = Carbon::parse($fechaInicio);
        $fechaFin = $fechaInicioCarbon->copy()->endOfWeek()->format('Y-m-d');

        // Obtener el plan activo del paciente
        $plan = PlanAlimentacion::where('id_paciente', $paciente->id_paciente)
            ->where('fecha_inicio', '<=', $fechaFin)
            ->where('fecha_fin', '>=', $fechaInicio)
            ->with(['nutricionista', 'paciente'])
            ->first();

        if (!$plan) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No tienes un plan activo para esta semana'
            ]);
        }

        // Obtener todas las comidas del plan para la semana a través de plan_dias
        $comidas = Comida::whereHas('planDia', function($query) use ($plan, $fechaInicio, $fechaFin) {
                $query->where('id_plan', $plan->id_plan)
                      ->whereBetween('fecha', [$fechaInicio, $fechaFin]);
            })
            ->with(['alimentos' => function($query) {
                $query->select(
                    'alimentos.id_alimento',
                    'alimentos.nombre',
                    'alimento_comida.cantidad_gramos',
                    'alimentos.calorias_por_100g',
                    'alimentos.proteinas_por_100g',
                    'alimentos.carbohidratos_por_100g',
                    'alimentos.grasas_por_100g'
                );
            }])
            ->orderBy('fecha')
            ->orderBy('hora_recomendada')
            ->get();

        // Organizar comidas por día
        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        $menuPorDia = [];
        
        for ($i = 0; $i < 7; $i++) {
            $fecha = $fechaInicioCarbon->copy()->addDays($i);
            $fechaStr = $fecha->format('Y-m-d');
            $diaSemana = $diasSemana[$i];
            
            $comidasDelDia = $comidas->filter(function($comida) use ($fechaStr) {
                return $comida->fecha === $fechaStr;
            });

            $totalesDia = [
                'calorias' => 0,
                'proteinas' => 0,
                'carbohidratos' => 0,
                'grasas' => 0
            ];

            $comidasFormateadas = $comidasDelDia->map(function($comida) use (&$totalesDia) {
                $totalesComida = [
                    'calorias' => 0,
                    'proteinas' => 0,
                    'carbohidratos' => 0,
                    'grasas' => 0
                ];

                $alimentosFormateados = $comida->alimentos->map(function($alimento) use (&$totalesComida) {
                    $factor = $alimento->pivot->cantidad_gramos / 100;
                    
                    $calorias = round($alimento->calorias_por_100g * $factor, 1);
                    $proteinas = round($alimento->proteinas_por_100g * $factor, 1);
                    $carbohidratos = round($alimento->carbohidratos_por_100g * $factor, 1);
                    $grasas = round($alimento->grasas_por_100g * $factor, 1);

                    $totalesComida['calorias'] += $calorias;
                    $totalesComida['proteinas'] += $proteinas;
                    $totalesComida['carbohidratos'] += $carbohidratos;
                    $totalesComida['grasas'] += $grasas;

                    return [
                        'id_alimento' => $alimento->id_alimento,
                        'nombre' => $alimento->nombre,
                        'cantidad_gramos' => $alimento->pivot->cantidad_gramos,
                        'calorias' => $calorias,
                        'proteinas' => $proteinas,
                        'carbohidratos' => $carbohidratos,
                        'grasas' => $grasas
                    ];
                });

                // Sumar al total del día
                $totalesDia['calorias'] += $totalesComida['calorias'];
                $totalesDia['proteinas'] += $totalesComida['proteinas'];
                $totalesDia['carbohidratos'] += $totalesComida['carbohidratos'];
                $totalesDia['grasas'] += $totalesComida['grasas'];

                return [
                    'id_comida' => $comida->id_comida,
                    'tipo_comida' => $comida->tipo_comida,
                    'nombre' => $comida->nombre,
                    'hora_recomendada' => $comida->hora_recomendada ? Carbon::parse($comida->hora_recomendada)->format('H:i') : null,
                    'instrucciones' => $comida->instrucciones,
                    'alimentos' => $alimentosFormateados,
                    'totales' => [
                        'calorias' => round($totalesComida['calorias']),
                        'proteinas' => round($totalesComida['proteinas'], 1),
                        'carbohidratos' => round($totalesComida['carbohidratos'], 1),
                        'grasas' => round($totalesComida['grasas'], 1)
                    ]
                ];
            })->values();

            $menuPorDia[] = [
                'dia_semana' => $diaSemana,
                'fecha' => $fechaStr,
                'comidas' => $comidasFormateadas,
                'totales_dia' => [
                    'calorias' => round($totalesDia['calorias']),
                    'proteinas' => round($totalesDia['proteinas'], 1),
                    'carbohidratos' => round($totalesDia['carbohidratos'], 1),
                    'grasas' => round($totalesDia['grasas'], 1)
                ]
            ];
        }

        // Calcular totales de la semana
        $totalesSemana = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
            'total_comidas' => 0
        ];

        foreach ($menuPorDia as $dia) {
            $totalesSemana['calorias'] += $dia['totales_dia']['calorias'];
            $totalesSemana['proteinas'] += $dia['totales_dia']['proteinas'];
            $totalesSemana['carbohidratos'] += $dia['totales_dia']['carbohidratos'];
            $totalesSemana['grasas'] += $dia['totales_dia']['grasas'];
            $totalesSemana['total_comidas'] += count($dia['comidas']);
        }

        $totalesSemana['calorias'] = round($totalesSemana['calorias']);
        $totalesSemana['proteinas'] = round($totalesSemana['proteinas'], 1);
        $totalesSemana['carbohidratos'] = round($totalesSemana['carbohidratos'], 1);
        $totalesSemana['grasas'] = round($totalesSemana['grasas'], 1);

        return response()->json([
            'success' => true,
            'data' => [
                'plan' => [
                    'id_plan' => $plan->id_plan,
                    'nombre_plan' => $plan->nombre_plan ?? $plan->nombre,
                    'objetivo' => $plan->objetivo ?? 'Sin objetivo definido',
                    'calorias_objetivo' => $plan->calorias_objetivo ?? 0,
                    'nutricionista' => $plan->nutricionista ? $plan->nutricionista->nombre : null
                ],
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'dias' => $menuPorDia,
                'totales_semana' => $totalesSemana
            ]
        ]);
        
        } catch (\Exception $e) {
            \Log::error('Error en getMiMenuSemanal: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el menú semanal',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}
