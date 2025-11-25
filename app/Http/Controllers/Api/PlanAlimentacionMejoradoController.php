<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlanAlimentacionMejoradoController extends Controller
{
    /**
     * Listar planes con sus relaciones
     */
    public function index(Request $request)
    {
        $query = PlanAlimentacion::with(['contrato.paciente.user', 'contrato.servicio', 'planDias.comidas.alimentos']);
        
        // Búsqueda por nombre, apellido, correo o celular del paciente
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('contrato.paciente', function($q) use ($search) {
                $q->where('nombre', 'LIKE', "%{$search}%")
                  ->orWhere('apellido', 'LIKE', "%{$search}%")
                  ->orWhere('celular', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('email', 'LIKE', "%{$search}%");
                  });
            });
        }
        
        // Filtrar por paciente ID específico
        if ($request->has('paciente_id')) {
            $query->whereHas('contrato', function($q) use ($request) {
                $q->where('id_paciente', $request->paciente_id);
            });
        }
        
        // Filtrar por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        
        // Filtrar solo planes activos
        if ($request->has('activo') && $request->activo == 1) {
            $query->where('estado', 'ACTIVO');
        }
        
        $planes = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json($planes);
    }

    /**
     * Crear nuevo plan de alimentación
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre_plan' => 'required|string|max:150',
            'objetivo' => 'required|in:PERDIDA_PESO,GANANCIA_MUSCULAR,MANTENIMIENTO,SALUD_GENERAL,RENDIMIENTO_DEPORTIVO',
            'calorias_objetivo' => 'required|integer|min:1000|max:5000',
            'descripcion' => 'nullable|string',
            'id_contrato' => 'required|exists:contratos,id_contrato',
            'id_nutricionista' => 'nullable|exists:nutricionistas,id_nutricionista',
            'estado' => 'nullable|in:ACTIVO,INACTIVO,FINALIZADO',
            'plan_dias' => 'required|array|min:7|max:7',
            'plan_dias.*.dia_numero' => 'required|integer|min:1|max:7',
            'plan_dias.*.dia_semana' => 'required|in:LUNES,MARTES,MIERCOLES,JUEVES,VIERNES,SABADO,DOMINGO',
            'plan_dias.*.fecha' => 'required|date',
            'plan_dias.*.comidas' => 'required|array|min:5|max:5',
            'plan_dias.*.comidas.*.tipo_comida' => 'required|in:DESAYUNO,COLACION_MATUTINA,ALMUERZO,COLACION_VESPERTINA,CENA',
            'plan_dias.*.comidas.*.hora_recomendada' => 'required|date_format:H:i',
            'plan_dias.*.comidas.*.nombre' => 'nullable|string|max:150',
            'plan_dias.*.comidas.*.descripcion' => 'nullable|string',
            'plan_dias.*.comidas.*.instrucciones' => 'nullable|string',
            'plan_dias.*.comidas.*.orden' => 'required|integer',
            'plan_dias.*.comidas.*.alimentos' => 'nullable|array', // Cambiado: ahora permite array vacío
            'plan_dias.*.comidas.*.alimentos.*.id_alimento' => 'required_with:plan_dias.*.comidas.*.alimentos|exists:alimentos,id_alimento',
            'plan_dias.*.comidas.*.alimentos.*.cantidad_gramos' => 'required_with:plan_dias.*.comidas.*.alimentos|numeric|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Obtener el contrato con el paciente
            $contrato = \App\Models\Contrato::with('paciente')->findOrFail($request->id_contrato);
            
            // Determinar el id_nutricionista
            $user = $request->user();
            $idNutricionista = null;
            
            // 1. Si se especifica en la petición (admin puede especificarlo)
            if ($request->has('id_nutricionista')) {
                $idNutricionista = $request->id_nutricionista;
            }
            // 2. Si el usuario es nutricionista, usar su ID
            elseif ($user->nutricionista) {
                $idNutricionista = $user->nutricionista->id_nutricionista;
            }
            // 3. Si no, usar el nutricionista asignado al paciente
            elseif ($contrato->paciente && $contrato->paciente->id_nutricionista) {
                $idNutricionista = $contrato->paciente->id_nutricionista;
            }
            
            // Validar que se haya obtenido un nutricionista
            if (!$idNutricionista) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo determinar el nutricionista para este plan. El paciente debe tener un nutricionista asignado.'
                ], 422);
            }
            
            // Calcular fecha_inicio y fecha_fin desde los días del plan
            $fechas = collect($request->plan_dias)->pluck('fecha')->sort();
            $fechaInicio = $fechas->first();
            $fechaFin = $fechas->last();
            
            // Crear el plan
            $plan = PlanAlimentacion::create([
                'nombre' => $request->nombre_plan, // Campo legacy
                'nombre_plan' => $request->nombre_plan,
                'objetivo' => $request->objetivo,
                'calorias_objetivo' => $request->calorias_objetivo,
                'descripcion' => $request->descripcion,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'id_contrato' => $request->id_contrato,
                'id_paciente' => $contrato->id_paciente,
                'id_nutricionista' => $idNutricionista,
                'estado' => $request->estado ?? 'ACTIVO',
            ]);

            // Crear días del plan
            foreach ($request->plan_dias as $diaData) {
                $planDia = PlanDia::create([
                    'id_plan' => $plan->id_plan,
                    'dia_index' => $diaData['dia_numero'], // Campo legacy
                    'dia_numero' => $diaData['dia_numero'],
                    'dia_semana' => $diaData['dia_semana'],
                    'fecha' => $diaData['fecha'],
                ]);

                // Crear comidas del día
                foreach ($diaData['comidas'] as $comidaData) {
                    $comida = Comida::create([
                        'id_dia' => $planDia->id_dia,
                        'tipo_comida' => $comidaData['tipo_comida'],
                        'hora_recomendada' => $comidaData['hora_recomendada'],
                        'nombre' => $comidaData['nombre'] ?? null,
                        'descripcion' => $comidaData['descripcion'] ?? null,
                        'instrucciones' => $comidaData['instrucciones'] ?? null,
                        'orden' => $comidaData['orden'],
                    ]);

                    // Adjuntar alimentos a la comida con cantidades (solo si hay alimentos)
                    if (!empty($comidaData['alimentos'])) {
                        foreach ($comidaData['alimentos'] as $alimentoData) {
                            $comida->alimentos()->attach($alimentoData['id_alimento'], [
                                'cantidad_gramos' => $alimentoData['cantidad_gramos']
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Plan de alimentación creado exitosamente',
                'data' => $plan->load('planDias.comidas.alimentos', 'contrato.paciente')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un plan específico
     */
    public function show($id)
    {
        $plan = PlanAlimentacion::with([
            'contrato.paciente',
            'contrato.servicio',
            'planDias' => function($query) {
                $query->orderBy('dia_numero');
            },
            'planDias.comidas' => function($query) {
                $query->orderBy('orden');
            },
            'planDias.comidas.alimentos'
        ])->find($id);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $plan
        ]);
    }

    /**
     * Actualizar plan de alimentación
     */
    public function update(Request $request, $id)
    {
        $plan = PlanAlimentacion::findOrFail($id);

        $request->validate([
            'nombre_plan' => 'required|string|max:150',
            'objetivo' => 'required|in:PERDIDA_PESO,GANANCIA_MUSCULAR,MANTENIMIENTO,SALUD_GENERAL,RENDIMIENTO_DEPORTIVO',
            'calorias_objetivo' => 'required|integer|min:1000|max:5000',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:ACTIVO,INACTIVO,FINALIZADO',
            'plan_dias' => 'required|array|min:7|max:7',
        ]);

        DB::beginTransaction();
        try {
            // Calcular fecha_inicio y fecha_fin desde los días del plan
            $fechas = collect($request->plan_dias)->pluck('fecha')->sort();
            $fechaInicio = $fechas->first();
            $fechaFin = $fechas->last();
            
            // Actualizar plan
            $plan->update([
                'nombre' => $request->nombre_plan, // Campo legacy
                'nombre_plan' => $request->nombre_plan,
                'objetivo' => $request->objetivo,
                'calorias_objetivo' => $request->calorias_objetivo,
                'descripcion' => $request->descripcion,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'estado' => $request->estado ?? $plan->estado,
            ]);

            // Eliminar días antiguos y sus comidas
            foreach ($plan->planDias as $dia) {
                foreach ($dia->comidas as $comida) {
                    $comida->alimentos()->detach();
                    $comida->delete();
                }
                $dia->delete();
            }

            // Crear nuevos días
            foreach ($request->plan_dias as $diaData) {
                $planDia = PlanDia::create([
                    'id_plan' => $plan->id_plan,
                    'dia_index' => $diaData['dia_numero'], // Campo legacy
                    'dia_numero' => $diaData['dia_numero'],
                    'dia_semana' => $diaData['dia_semana'],
                    'fecha' => $diaData['fecha'],
                ]);

                foreach ($diaData['comidas'] as $comidaData) {
                    $comida = Comida::create([
                        'id_dia' => $planDia->id_dia,
                        'tipo_comida' => $comidaData['tipo_comida'],
                        'hora_recomendada' => $comidaData['hora_recomendada'],
                        'nombre' => $comidaData['nombre'] ?? null,
                        'descripcion' => $comidaData['descripcion'] ?? null,
                        'instrucciones' => $comidaData['instrucciones'] ?? null,
                        'orden' => $comidaData['orden'],
                    ]);

                    // Adjuntar alimentos solo si hay alimentos
                    if (!empty($comidaData['alimentos'])) {
                        foreach ($comidaData['alimentos'] as $alimentoData) {
                            $comida->alimentos()->attach($alimentoData['id_alimento'], [
                                'cantidad_gramos' => $alimentoData['cantidad_gramos']
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Plan actualizado exitosamente',
                'data' => $plan->load('planDias.comidas.alimentos')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar plan
     */
    public function destroy($id)
    {
        $plan = PlanAlimentacion::findOrFail($id);

        DB::beginTransaction();
        try {
            // Eliminar días, comidas y relaciones
            foreach ($plan->planDias as $dia) {
                foreach ($dia->comidas as $comida) {
                    $comida->alimentos()->detach();
                    $comida->delete();
                }
                $dia->delete();
            }

            $plan->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Plan eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duplicar un plan para otra semana
     */
    public function duplicar(Request $request, $id)
    {
        $planOriginal = PlanAlimentacion::with('planDias.comidas.alimentos')->findOrFail($id);

        $request->validate([
            'nombre_plan' => 'required|string|max:150',
            'fecha_inicio' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            // Calcular fecha_inicio y fecha_fin
            $fechaInicio = Carbon::parse($request->fecha_inicio);
            $fechaFin = $fechaInicio->copy()->addDays(6);
            
            // Crear nuevo plan
            $nuevoPlan = PlanAlimentacion::create([
                'nombre' => $request->nombre_plan, // Campo legacy
                'nombre_plan' => $request->nombre_plan,
                'objetivo' => $planOriginal->objetivo,
                'calorias_objetivo' => $planOriginal->calorias_objetivo,
                'descripcion' => $planOriginal->descripcion,
                'fecha_inicio' => $fechaInicio->toDateString(),
                'fecha_fin' => $fechaFin->toDateString(),
                'id_contrato' => $planOriginal->id_contrato,
                'id_paciente' => $planOriginal->id_paciente,
                'id_nutricionista' => $planOriginal->id_nutricionista,
                'estado' => 'ACTIVO',
            ]);

            // Copiar días
            foreach ($planOriginal->planDias as $index => $diaOriginal) {
                $nuevaFecha = Carbon::parse($request->fecha_inicio)->addDays($index);
                
                $nuevoDia = PlanDia::create([
                    'id_plan' => $nuevoPlan->id_plan,
                    'dia_index' => $diaOriginal->dia_numero, // Campo legacy
                    'dia_numero' => $diaOriginal->dia_numero,
                    'dia_semana' => $diaOriginal->dia_semana,
                    'fecha' => $nuevaFecha->toDateString(),
                ]);

                // Copiar comidas
                foreach ($diaOriginal->comidas as $comidaOriginal) {
                    $nuevaComida = Comida::create([
                        'id_dia' => $nuevoDia->id_dia,
                        'tipo_comida' => $comidaOriginal->tipo_comida,
                        'hora_recomendada' => $comidaOriginal->hora_recomendada,
                        'nombre' => $comidaOriginal->nombre,
                        'descripcion' => $comidaOriginal->descripcion,
                        'instrucciones' => $comidaOriginal->instrucciones,
                        'orden' => $comidaOriginal->orden,
                    ]);

                    // Copiar alimentos (solo si la comida tiene alimentos)
                    if ($comidaOriginal->alimentos->count() > 0) {
                        foreach ($comidaOriginal->alimentos as $alimento) {
                            $nuevaComida->alimentos()->attach($alimento->id_alimento, [
                                'cantidad_gramos' => $alimento->pivot->cantidad_gramos
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Plan duplicado exitosamente',
                'data' => $nuevoPlan->load('planDias.comidas.alimentos')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al duplicar plan: ' . $e->getMessage()
            ], 500);
        }
    }
}
