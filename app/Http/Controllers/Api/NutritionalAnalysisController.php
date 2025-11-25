<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NutritionalAnalysisService;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Controlador para análisis nutricional avanzado
 * Feature: mejoras-sistema-core, Fase 2
 */
class NutritionalAnalysisController extends Controller
{
    protected $nutritionalAnalysisService;

    public function __construct(NutritionalAnalysisService $nutritionalAnalysisService)
    {
        $this->nutritionalAnalysisService = $nutritionalAnalysisService;
    }

    /**
     * Análisis nutricional de una comida específica
     */
    public function analizarComida($comidaId)
    {
        try {
            $comida = Comida::with(['dia.plan', 'alimentos', 'recetas.alimentos'])->findOrFail($comidaId);

            // Verificar permisos
            if ($comida->dia->plan->id_nutricionista !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para acceder a esta comida'
                ], 403);
            }

            $macronutrientes = $this->nutritionalAnalysisService->calcularMacronutrientesComida($comidaId);
            $analisisCompleto = $comida->obtenerAnalisisNutricional();

            return response()->json([
                'success' => true,
                'data' => [
                    'comida' => [
                        'id' => $comida->id_comida,
                        'nombre' => $comida->nombre,
                        'tipo_comida' => $comida->tipo_comida,
                        'opcion_numero' => $comida->opcion_numero
                    ],
                    'macronutrientes' => $macronutrientes,
                    'analisis_completo' => $analisisCompleto
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al analizar comida: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar la comida'
            ], 500);
        }
    }

    /**
     * Análisis nutricional de un día completo
     */
    public function analizarDia($diaId)
    {
        try {
            $dia = PlanDia::with(['plan', 'comidas.alimentos', 'comidas.recetas.alimentos'])->findOrFail($diaId);

            // Verificar permisos
            if ($dia->plan->id_nutricionista !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para acceder a este día'
                ], 403);
            }

            $analisisDia = $this->nutritionalAnalysisService->analizarDia($diaId);

            return response()->json([
                'success' => true,
                'data' => $analisisDia
            ]);
        } catch (\Exception $e) {
            Log::error('Error al analizar día: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar el día'
            ], 500);
        }
    }

    /**
     * Análisis nutricional de un plan completo
     */
    public function analizarPlan($planId)
    {
        try {
            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', Auth::id())
                ->firstOrFail();

            $analisisPlan = $this->nutritionalAnalysisService->analizarPlan($planId);

            return response()->json([
                'success' => true,
                'data' => $analisisPlan
            ]);
        } catch (\Exception $e) {
            Log::error('Error al analizar plan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al analizar el plan'
            ], 500);
        }
    }

    /**
     * Comparar plan con objetivos nutricionales
     */
    public function compararConObjetivos(Request $request, $planId)
    {
        try {
            $request->validate([
                'objetivos' => 'required|array',
                'objetivos.calorias' => 'nullable|numeric|min:0',
                'objetivos.proteinas' => 'nullable|numeric|min:0',
                'objetivos.carbohidratos' => 'nullable|numeric|min:0',
                'objetivos.grasas' => 'nullable|numeric|min:0',
                'objetivos.fibra' => 'nullable|numeric|min:0'
            ]);

            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', Auth::id())
                ->firstOrFail();

            $analisisPlan = $this->nutritionalAnalysisService->analizarPlan($planId);
            $comparacion = $this->nutritionalAnalysisService->compararConObjetivos($analisisPlan, $request->objetivos);

            return response()->json([
                'success' => true,
                'data' => [
                    'plan' => [
                        'id' => $plan->id_plan,
                        'nombre' => $plan->nombre_plan
                    ],
                    'objetivos' => $request->objetivos,
                    'analisis' => $analisisPlan['promedio_diario'],
                    'comparacion' => $comparacion
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al comparar con objetivos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al comparar con objetivos'
            ], 500);
        }
    }

    /**
     * Generar reporte nutricional completo
     */
    public function generarReporte(Request $request, $planId)
    {
        try {
            $request->validate([
                'objetivos' => 'nullable|array',
                'incluir_graficos' => 'nullable|boolean',
                'formato' => 'nullable|in:json,pdf'
            ]);

            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', Auth::id())
                ->firstOrFail();

            $objetivos = $request->objetivos;
            $reporte = $this->nutritionalAnalysisService->generarReporte($planId, $objetivos);

            // Agregar información del plan al reporte
            $reporte['plan_info'] = [
                'id' => $plan->id_plan,
                'nombre' => $plan->nombre_plan,
                'paciente' => $plan->paciente->nombre ?? 'Sin asignar',
                'nutricionista' => $plan->nutricionista->nombre ?? 'Sin asignar',
                'fecha_inicio' => $plan->fecha_inicio,
                'fecha_fin' => $plan->fecha_fin
            ];

            return response()->json([
                'success' => true,
                'data' => $reporte
            ]);
        } catch (\Exception $e) {
            Log::error('Error al generar reporte: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el reporte'
            ], 500);
        }
    }

    /**
     * Obtener análisis nutricional resumido para dashboard
     */
    public function resumenNutricional($planId)
    {
        try {
            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', Auth::id())
                ->firstOrFail();

            $analisisPlan = $this->nutritionalAnalysisService->analizarPlan($planId);

            // Crear resumen para dashboard
            $resumen = [
                'calorias_promedio' => $analisisPlan['promedio_diario']['calorias'],
                'distribucion_macronutrientes' => [
                    'proteinas' => $analisisPlan['promedio_diario']['proteinas'],
                    'carbohidratos' => $analisisPlan['promedio_diario']['carbohidratos'],
                    'grasas' => $analisisPlan['promedio_diario']['grasas']
                ],
                'variabilidad' => $analisisPlan['variabilidad']['calorias']['coeficiente_variacion'],
                'dias_analizados' => count($analisisPlan['dias'])
            ];

            return response()->json([
                'success' => true,
                'data' => $resumen
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener resumen nutricional: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el resumen nutricional'
            ], 500);
        }
    }
}

