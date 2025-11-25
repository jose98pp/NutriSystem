<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use App\Models\PlanAlimentacion;
use App\Models\Ingesta;
use App\Models\Evaluacion;
use App\Models\ProgressPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas generales del dashboard
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'nutricionista' || $user->role === 'admin') {
            return $this->getNutricionistaStats($user);
        } else {
            return $this->getPacienteStats($user);
        }
    }

    /**
     * Estadísticas para Nutricionista/Admin
     */
    private function getNutricionistaStats($user)
    {
        try {
            // Contar pacientes totales
            $totalPacientes = User::where('role', 'paciente')->count();

            // Pacientes activos (con plan vigente)
            $pacientesActivos = PlanAlimentacion::where('fecha_fin', '>=', now())
                ->distinct('id_paciente')
                ->count('id_paciente');

            // Total de planes creados
            $totalPlanes = PlanAlimentacion::count();

            // Planes activos
            $planesActivos = PlanAlimentacion::where('fecha_fin', '>=', now())->count();

            // Total de evaluaciones
            $totalEvaluaciones = $this->safeCount('evaluaciones');

            // Evaluaciones este mes
            $evaluacionesMes = 0;
            if ($this->tableExists('evaluaciones')) {
                $evaluacionesMes = Evaluacion::whereMonth('fecha', now()->month)
                    ->whereYear('fecha', now()->year)
                    ->count();
            }

            // Mensajes no leídos
            $mensajesNoLeidos = 0;
            if ($this->tableExists('messages')) {
                $mensajesNoLeidos = DB::table('messages')
                    ->where('id_destinatario', $user->id)
                    ->where('leido', false)
                    ->count();
            }

            // Pacientes recientes (últimos 7 días)
            $pacientesRecientes = User::where('role', 'paciente')
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            // Tendencia de peso de todos los pacientes (últimos 6 meses)
            $tendenciaPeso = [];
            if ($this->tableExists('evaluaciones')) {
                $tendenciaPeso = Evaluacion::select(
                        DB::raw('DATE_FORMAT(fecha, "%Y-%m") as mes'),
                        DB::raw('AVG(peso_kg) as peso_promedio')
                    )
                    ->whereNotNull('peso_kg')
                    ->where('fecha', '>=', now()->subMonths(6))
                    ->groupBy('mes')
                    ->orderBy('mes')
                    ->get();
            }

            // Adherencia promedio al plan
            $adherenciaPromedio = $this->calcularAdherenciaGeneral();

            // Top 5 pacientes con mejor progreso
            $topPacientes = $this->getTopPacientes();

            // Distribución de IMC
            $distribucionIMC = $this->getDistribucionIMC();

            return response()->json([
                'totales' => [
                    'pacientes' => $totalPacientes,
                    'pacientes_activos' => $pacientesActivos,
                    'planes' => $totalPlanes,
                    'planes_activos' => $planesActivos,
                    'evaluaciones' => $totalEvaluaciones,
                    'evaluaciones_mes' => $evaluacionesMes,
                    'mensajes_no_leidos' => $mensajesNoLeidos,
                    'pacientes_recientes' => $pacientesRecientes
                ],
                'tendencia_peso' => $tendenciaPeso,
                'adherencia_promedio' => $adherenciaPromedio,
                'top_pacientes' => $topPacientes,
                'distribucion_imc' => $distribucionIMC
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en getNutricionistaStats: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas para Paciente
     */
    private function getPacienteStats($user)
    {
        try {
            // Obtener id_paciente del usuario
            $idPaciente = $user->id_paciente ?? Paciente::where('user_id', $user->id)->value('id_paciente');
            
            if (!$idPaciente) {
                return response()->json([
                    'error' => 'No se encontró información de paciente'
                ], 404);
            }
            
            $paciente = Paciente::where('id_paciente', $idPaciente)->first();

            // Plan actual
            $planActual = PlanAlimentacion::where('id_paciente', $idPaciente)
                ->where('fecha_inicio', '<=', now())
                ->where('fecha_fin', '>=', now())
                ->first();

            // Total de ingestas registradas
            $totalIngestas = $this->safeCount('ingestas', ['id_paciente' => $idPaciente]);

            // Ingestas esta semana
            $ingestasSemana = 0;
            if ($this->tableExists('ingestas')) {
                $ingestasSemana = Ingesta::where('id_paciente', $idPaciente)
                    ->whereBetween('fecha_hora', [now()->startOfWeek(), now()->endOfWeek()])
                    ->count();
            }

            // Total de evaluaciones
            $totalEvaluaciones = $this->safeCount('evaluaciones', ['id_paciente' => $idPaciente]);

            // Última evaluación
            $ultimaEvaluacion = null;
            if ($this->tableExists('evaluaciones')) {
                $ultimaEvaluacion = Evaluacion::where('id_paciente', $idPaciente)
                    ->orderBy('fecha', 'desc')
                    ->first();
            }

            // Evolución de peso (últimos 6 meses)
            $evolucionPeso = [];
            if ($this->tableExists('evaluaciones')) {
                $evolucionPeso = Evaluacion::where('id_paciente', $idPaciente)
                    ->whereNotNull('peso_kg')
                    ->where('fecha', '>=', now()->subMonths(6))
                    ->orderBy('fecha')
                    ->get(['fecha', 'peso_kg']);
            }

            // Adherencia al plan
            $adherencia = $planActual ? $this->calcularAdherenciaPaciente($idPaciente, $planActual) : 0;

            // Fotos de progreso
            $totalFotos = $this->safeCount('progress_photos', ['id_paciente' => $idPaciente]);

            // Mensajes no leídos
            $mensajesNoLeidos = 0;
            if ($this->tableExists('messages')) {
                $mensajesNoLeidos = DB::table('messages')
                    ->where('id_destinatario', $user->id)
                    ->where('leido', false)
                    ->count();
            }

            // Progreso hacia el objetivo
            $progresoObjetivo = $this->calcularProgresoObjetivo($idPaciente);

            // Calorías promedio última semana
            $caloriasPromedio = $this->calcularCaloriasPromedio($idPaciente);

            return response()->json([
                'paciente' => $paciente,
                'plan_actual' => $planActual,
                'totales' => [
                    'ingestas' => $totalIngestas,
                    'ingestas_semana' => $ingestasSemana,
                    'evaluaciones' => $totalEvaluaciones,
                    'fotos_progreso' => $totalFotos,
                    'mensajes_no_leidos' => $mensajesNoLeidos
                ],
                'ultima_evaluacion' => $ultimaEvaluacion,
                'evolucion_peso' => $evolucionPeso,
                'adherencia' => $adherencia,
                'progreso_objetivo' => $progresoObjetivo,
                'calorias_promedio' => $caloriasPromedio
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en getPacienteStats: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener estadísticas del paciente',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular adherencia general de todos los pacientes (optimizado)
     */
    private function calcularAdherenciaGeneral()
    {
        try {
            if (!$this->tableExists('plan_alimentacion') || !$this->tableExists('ingestas')) {
                return 0;
            }

            // Consulta optimizada con agregaciones
            $adherencia = DB::table('plan_alimentacion as p')
                ->leftJoin('ingestas as i', function($join) {
                    $join->on('p.id_paciente', '=', 'i.id_paciente')
                         ->whereRaw('DATE(i.fecha_hora) BETWEEN p.fecha_inicio AND LEAST(p.fecha_fin, CURDATE())');
                })
                ->select([
                    DB::raw('AVG(
                        CASE 
                            WHEN DATEDIFF(LEAST(p.fecha_fin, CURDATE()), p.fecha_inicio) = 0 THEN 0
                            ELSE (COUNT(DISTINCT DATE(i.fecha_hora)) * 100.0) / 
                                 (DATEDIFF(LEAST(p.fecha_fin, CURDATE()), p.fecha_inicio) + 1)
                        END
                    ) as adherencia_promedio')
                ])
                ->where('p.fecha_fin', '>=', now())
                ->groupBy('p.id_paciente')
                ->get()
                ->avg('adherencia_promedio');

            return round($adherencia ?? 0, 2);
        } catch (\Exception $e) {
            \Log::error('Error en calcularAdherenciaGeneral: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Calcular adherencia de un paciente específico
     */
    private function calcularAdherenciaPaciente($pacienteId, $plan)
    {
        $diasPlan = now()->diffInDays($plan->fecha_inicio);
        if ($diasPlan > now()->diffInDays($plan->fecha_fin)) {
            $diasPlan = now()->diffInDays($plan->fecha_inicio, $plan->fecha_fin);
        }

        $ingestasRealizadas = Ingesta::where('id_paciente', $pacienteId)
            ->whereBetween('fecha_hora', [$plan->fecha_inicio, now()])
            ->count();

        $ingestasEsperadas = $diasPlan * 3; // 3 comidas al día

        return $ingestasEsperadas > 0 
            ? round(($ingestasRealizadas / $ingestasEsperadas) * 100, 2)
            : 0;
    }

    /**
     * Obtener top 5 pacientes con mejor progreso (optimizado)
     */
    private function getTopPacientes()
    {
        try {
            if (!$this->tableExists('evaluaciones')) {
                return collect([]);
            }

            // Consulta optimizada con subqueries para evitar N+1
            $topPacientes = DB::table('users')
                ->join('evaluaciones as e1', 'users.id', '=', 'e1.id_paciente')
                ->join('evaluaciones as e2', function($join) {
                    $join->on('users.id', '=', 'e2.id_paciente')
                         ->whereRaw('e2.fecha = (SELECT MAX(fecha) FROM evaluaciones WHERE id_paciente = users.id)');
                })
                ->join('evaluaciones as e3', function($join) {
                    $join->on('users.id', '=', 'e3.id_paciente')
                         ->whereRaw('e3.fecha = (SELECT MIN(fecha) FROM evaluaciones WHERE id_paciente = users.id)');
                })
                ->select([
                    'users.id',
                    'users.name as nombre',
                    'e3.peso_kg as peso_inicial',
                    'e2.peso_kg as peso_actual',
                    DB::raw('ROUND(e3.peso_kg - e2.peso_kg, 2) as perdida_peso'),
                    DB::raw('COUNT(DISTINCT e1.id_evaluacion) as evaluaciones')
                ])
                ->where('users.role', 'paciente')
                ->whereNotNull('e2.peso_kg')
                ->whereNotNull('e3.peso_kg')
                ->groupBy('users.id', 'users.name', 'e3.peso_kg', 'e2.peso_kg')
                ->having('evaluaciones', '>=', 2)
                ->having('perdida_peso', '>', 0)
                ->orderByDesc('perdida_peso')
                ->limit(5)
                ->get();

            return $topPacientes->map(function($paciente) {
                return [
                    'id' => $paciente->id,
                    'nombre' => $paciente->nombre,
                    'perdida_peso' => (float) $paciente->perdida_peso,
                    'peso_inicial' => (float) $paciente->peso_inicial,
                    'peso_actual' => (float) $paciente->peso_actual,
                    'evaluaciones' => (int) $paciente->evaluaciones
                ];
            });
        } catch (\Exception $e) {
            \Log::error('Error en getTopPacientes: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Obtener distribución de IMC (optimizado)
     */
    private function getDistribucionIMC()
    {
        try {
            if (!$this->tableExists('evaluaciones')) {
                return [
                    'bajo_peso' => 0,
                    'normal' => 0,
                    'sobrepeso' => 0,
                    'obesidad' => 0
                ];
            }

            // Consulta optimizada con una sola query
            $distribucion = DB::table('evaluaciones as e1')
                ->join(DB::raw('(SELECT id_paciente, MAX(fecha) as max_fecha FROM evaluaciones GROUP BY id_paciente) as e2'), 
                       function($join) {
                           $join->on('e1.id_paciente', '=', 'e2.id_paciente')
                                ->on('e1.fecha', '=', 'e2.max_fecha');
                       })
                ->select([
                    DB::raw('SUM(CASE WHEN (peso_kg / (altura_m * altura_m)) < 18.5 THEN 1 ELSE 0 END) as bajo_peso'),
                    DB::raw('SUM(CASE WHEN (peso_kg / (altura_m * altura_m)) >= 18.5 AND (peso_kg / (altura_m * altura_m)) < 25 THEN 1 ELSE 0 END) as normal'),
                    DB::raw('SUM(CASE WHEN (peso_kg / (altura_m * altura_m)) >= 25 AND (peso_kg / (altura_m * altura_m)) < 30 THEN 1 ELSE 0 END) as sobrepeso'),
                    DB::raw('SUM(CASE WHEN (peso_kg / (altura_m * altura_m)) >= 30 THEN 1 ELSE 0 END) as obesidad')
                ])
                ->whereNotNull('peso_kg')
                ->whereNotNull('altura_m')
                ->where('altura_m', '>', 0)
                ->first();

            return [
                'bajo_peso' => (int) ($distribucion->bajo_peso ?? 0),
                'normal' => (int) ($distribucion->normal ?? 0),
                'sobrepeso' => (int) ($distribucion->sobrepeso ?? 0),
                'obesidad' => (int) ($distribucion->obesidad ?? 0)
            ];
        } catch (\Exception $e) {
            \Log::error('Error en getDistribucionIMC: ' . $e->getMessage());
            return [
                'bajo_peso' => 0,
                'normal' => 0,
                'sobrepeso' => 0,
                'obesidad' => 0
            ];
        }
    }

    /**
     * Calcular progreso hacia el objetivo
     */
    private function calcularProgresoObjetivo($pacienteId)
    {
        try {
            if (!$this->tableExists('evaluaciones')) {
                return null;
            }

            $paciente = Paciente::where('id_paciente', $pacienteId)->first();
            
            if (!$paciente || !$paciente->peso_objetivo_kg) {
                return null;
            }

            $primeraEval = Evaluacion::where('id_paciente', $pacienteId)
                ->orderBy('fecha', 'asc')
                ->first();

            $ultimaEval = Evaluacion::where('id_paciente', $pacienteId)
                ->orderBy('fecha', 'desc')
                ->first();

            if (!$primeraEval || !$ultimaEval) {
                return null;
            }

            $pesoInicial = $primeraEval->peso_kg;
            $pesoActual = $ultimaEval->peso_kg;
            $pesoObjetivo = $paciente->peso_objetivo_kg;

            $totalAPerder = abs($pesoInicial - $pesoObjetivo);
            $perdidoHastaAhora = abs($pesoInicial - $pesoActual);

            $porcentaje = $totalAPerder > 0 
                ? round(($perdidoHastaAhora / $totalAPerder) * 100, 2)
                : 0;

            return [
                'peso_inicial' => $pesoInicial,
                'peso_actual' => $pesoActual,
                'peso_objetivo' => $pesoObjetivo,
                'total_a_perder' => $totalAPerder,
                'perdido_hasta_ahora' => $perdidoHastaAhora,
                'porcentaje' => min($porcentaje, 100)
            ];
        } catch (\Exception $e) {
            \Log::error('Error en calcularProgresoObjetivo: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calcular calorías promedio de la última semana
     */
    private function calcularCaloriasPromedio($pacienteId)
    {
        try {
            if (!$this->tableExists('ingestas')) {
                return 0;
            }

            $ingestas = Ingesta::where('id_paciente', $pacienteId)
                ->where('fecha_hora', '>=', now()->subDays(7))
                ->with('alimentos')
                ->get();

            if ($ingestas->isEmpty()) {
                return 0;
            }

            // Calcular calorías totales de cada ingesta
            $totalCalorias = 0;
            foreach ($ingestas as $ingesta) {
                $totales = $ingesta->calcularTotales();
                $totalCalorias += $totales['calorias'];
            }

            $dias = $ingestas->pluck('fecha_hora')->map(function($fecha) {
                return date('Y-m-d', strtotime($fecha));
            })->unique()->count();

            return $dias > 0 ? round($totalCalorias / $dias, 0) : 0;
        } catch (\Exception $e) {
            \Log::error('Error en calcularCaloriasPromedio: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Verificar si una tabla existe en la base de datos
     */
    private function tableExists($tableName)
    {
        try {
            return DB::getSchemaBuilder()->hasTable($tableName);
        } catch (\Exception $e) {
            \Log::error("Error verificando tabla {$tableName}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Contar registros de forma segura
     */
    private function safeCount($tableName, $conditions = [])
    {
        try {
            if (!$this->tableExists($tableName)) {
                return 0;
            }

            $query = DB::table($tableName);
            
            foreach ($conditions as $column => $value) {
                $query->where($column, $value);
            }

            return $query->count();
        } catch (\Exception $e) {
            \Log::error("Error contando en tabla {$tableName}: " . $e->getMessage());
            return 0;
        }
    }
}
