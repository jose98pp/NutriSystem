<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Services\MealOptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanAlimentacionController extends Controller
{
    protected $mealOptionService;

    public function __construct(MealOptionService $mealOptionService)
    {
        $this->mealOptionService = $mealOptionService;
    }
    /**
     * Listar planes de alimentación
     */
    public function index(Request $request)
    {
        $query = PlanAlimentacion::with(['paciente.user', 'dias.comidas.alimentos']);
        
        // Búsqueda por nombre, apellido, correo o celular del paciente
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('paciente', function($q) use ($search) {
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
            $query->where('id_paciente', $request->paciente_id);
        }
        
        // Filtrar planes activos
        if ($request->has('activo') && $request->activo == 1) {
            $query->activos();
        }
        
        $planes = $query->paginate(10);
        
        return response()->json($planes);
    }

    /**
     * Crear nuevo plan de alimentación
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'id_contrato' => 'nullable|exists:contratos,id_contrato',
            'dias' => 'required|array|min:1',
            'dias.*.dia_index' => 'required|integer|min:1',
            'dias.*.comidas' => 'required|array|min:1',
            'dias.*.comidas.*.tipo_comida' => 'required|in:desayuno,almuerzo,cena,snack',
            'dias.*.comidas.*.orden' => 'required|integer',
            'dias.*.comidas.*.alimentos' => 'required|array|min:1',
            'dias.*.comidas.*.alimentos.*.id_alimento' => 'required|exists:alimentos,id_alimento',
            'dias.*.comidas.*.alimentos.*.cantidad_gramos' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();
        try {
            // Crear el plan
            $plan = PlanAlimentacion::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'id_paciente' => $request->id_paciente,
                'id_contrato' => $request->id_contrato,
            ]);

            // Crear días, comidas y alimentos
            foreach ($request->dias as $diaData) {
                $dia = PlanDia::create([
                    'id_plan' => $plan->id_plan,
                    'dia_index' => $diaData['dia_index'],
                ]);

                foreach ($diaData['comidas'] as $comidaData) {
                    $comida = Comida::create([
                        'id_dia' => $dia->id_dia,
                        'tipo_comida' => $comidaData['tipo_comida'],
                        'orden' => $comidaData['orden'],
                    ]);

                    // Adjuntar alimentos a la comida
                    foreach ($comidaData['alimentos'] as $alimentoData) {
                        $comida->alimentos()->attach($alimentoData['id_alimento'], [
                            'cantidad_gramos' => $alimentoData['cantidad_gramos']
                        ]);
                    }
                }
            }

            // Generar calendario de entregas automáticamente si hay contrato
            $calendarioCreado = false;
            $entregasGeneradas = 0;
            
            if ($plan->id_contrato) {
                $calendarioCreado = $this->generarCalendarioEntregas($plan);
                if ($calendarioCreado) {
                    $entregasGeneradas = $this->generarEntregasProgramadas($plan);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Plan de alimentación creado exitosamente',
                'plan' => $plan->load('dias.comidas.alimentos'),
                'calendario_entrega' => [
                    'creado' => $calendarioCreado,
                    'entregas_generadas' => $entregasGeneradas
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear plan: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generar calendario de entregas para el plan
     */
    private function generarCalendarioEntregas($plan)
    {
        try {
            // Verificar si ya existe un calendario para este contrato
            $calendarioExistente = \App\Models\CalendarioEntrega::where('id_contrato', $plan->id_contrato)->first();
            
            if ($calendarioExistente) {
                return false; // Ya existe, no crear duplicado
            }
            
            $calendario = \App\Models\CalendarioEntrega::create([
                'id_contrato' => $plan->id_contrato,
                'fecha_inicio' => $plan->fecha_inicio,
                'fecha_fin' => $plan->fecha_fin,
                'estado' => 'ACTIVO',
                'observaciones' => 'Calendario generado automáticamente al crear plan de alimentación'
            ]);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Error al generar calendario: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Generar entregas programadas basadas en el plan
     */
    private function generarEntregasProgramadas($plan)
    {
        try {
            $calendario = \App\Models\CalendarioEntrega::where('id_contrato', $plan->id_contrato)->first();
            
            if (!$calendario) {
                return 0;
            }
            
            // Obtener la dirección principal del paciente
            $direccion = \App\Models\Direccion::where('id_paciente', $plan->id_paciente)
                ->where('es_principal', true)
                ->first();
            
            if (!$direccion) {
                // Si no hay dirección principal, tomar la primera disponible
                $direccion = \App\Models\Direccion::where('id_paciente', $plan->id_paciente)->first();
            }
            
            if (!$direccion) {
                \Log::warning("No se encontró dirección para paciente {$plan->id_paciente}");
                return 0;
            }
            
            // Calcular número de días del plan
            $fechaInicio = new \DateTime($plan->fecha_inicio);
            $fechaFin = new \DateTime($plan->fecha_fin);
            $intervalo = $fechaInicio->diff($fechaFin);
            $totalDias = $intervalo->days + 1;
            
            // Generar entregas cada 7 días (semanal)
            $entregasCreadas = 0;
            $fechaEntrega = clone $fechaInicio;
            $numeroEntrega = 1;
            
            while ($fechaEntrega <= $fechaFin) {
                \App\Models\EntregaProgramada::create([
                    'id_calendario' => $calendario->id_calendario,
                    'numero_entrega' => $numeroEntrega,
                    'fecha_programada' => $fechaEntrega->format('Y-m-d'),
                    'direccion_entrega' => $direccion->direccion_completa,
                    'ciudad' => $direccion->ciudad,
                    'codigo_postal' => $direccion->codigo_postal,
                    'referencia' => $direccion->referencia,
                    'estado' => 'PENDIENTE',
                    'observaciones' => "Entrega semanal #{$numeroEntrega} - Plan: {$plan->nombre}"
                ]);
                
                $entregasCreadas++;
                $numeroEntrega++;
                
                // Avanzar 7 días
                $fechaEntrega->modify('+7 days');
            }
            
            return $entregasCreadas;
            
        } catch (\Exception $e) {
            \Log::error('Error al generar entregas programadas: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Mostrar plan específico
     */
    public function show($id)
    {
        $plan = PlanAlimentacion::with([
            'paciente',
            'dias' => function($query) {
                $query->orderBy('dia_index');
            },
            'dias.comidas' => function($query) {
                $query->orderBy('orden');
            },
            'dias.comidas.alimentos'
        ])->findOrFail($id);

        // Calcular totales nutricionales por día
        $plan->dias->each(function($dia) {
            $dia->totales = $dia->calcularTotales();
        });

        return response()->json($plan);
    }

    /**
     * Actualizar plan
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_inicio',
        ]);

        $plan = PlanAlimentacion::findOrFail($id);
        $plan->update($request->all());

        return response()->json([
            'message' => 'Plan actualizado exitosamente',
            'plan' => $plan
        ]);
    }

    /**
     * Eliminar plan
     */
    public function destroy($id)
    {
        $plan = PlanAlimentacion::findOrFail($id);
        $plan->delete();

        return response()->json([
            'message' => 'Plan eliminado exitosamente'
        ]);
    }

    /**
     * Toggle the status of the specified plan.
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $plan = PlanAlimentacion::findOrFail($id);
            
            $plan->activo = $request->input('activo', !$plan->activo);
            $plan->save();

            return response()->json([
                'success' => true,
                'message' => 'Estado del plan actualizado exitosamente',
                'data' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado del plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el plan activo del paciente autenticado
     */
    public function miPlan(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Obtener el paciente asociado al usuario
            $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            
            if (!$paciente) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró información del paciente'
                ], 404);
            }
            
            // Obtener planes del paciente ordenados por fecha
            $planes = PlanAlimentacion::with(['dias.comidas.alimentos', 'contrato.servicio'])
                ->where('id_paciente', $paciente->id_paciente)
                ->orderBy('fecha_inicio', 'desc')
                ->get();
            
            // Identificar el plan activo (si existe)
            $planActivo = $planes->first(function ($plan) {
                $hoy = now();
                return $plan->fecha_inicio <= $hoy && $plan->fecha_fin >= $hoy;
            });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'plan_activo' => $planActivo,
                    'todos_los_planes' => $planes,
                    'total_planes' => $planes->count()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener plan del paciente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar opción de comida a un turno específico
     */
    public function agregarOpcionComida(Request $request, $planId, $diaId)
    {
        try {
            $request->validate([
                'tipo_comida' => 'required|in:DESAYUNO,COLACION_MATUTINA,ALMUERZO,COLACION_VESPERTINA,CENA',
                'nombre' => 'required|string|max:150',
                'descripcion' => 'nullable|string',
                'instrucciones' => 'nullable|string',
                'hora_recomendada' => 'nullable|date_format:H:i',
                'nombre_opcion' => 'nullable|string|max:50',
                'alimentos' => 'nullable|array',
                'alimentos.*.id' => 'required_with:alimentos|exists:alimentos,id_alimento',
                'alimentos.*.cantidad' => 'required_with:alimentos|numeric|min:1',
                'recetas' => 'nullable|array',
                'recetas.*' => 'exists:recetas,id_receta'
            ]);

            // Verificar que el plan pertenece al usuario
            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', auth()->id())
                ->firstOrFail();

            // Verificar que el día pertenece al plan
            $dia = PlanDia::where('id_dia', $diaId)
                ->where('id_plan', $planId)
                ->firstOrFail();

            // Validar límite de opciones
            if (!$this->mealOptionService->validarLimiteOpciones($diaId, $request->tipo_comida)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pueden agregar más de 2 opciones por turno de comida'
                ], 400);
            }

            DB::beginTransaction();

            // Crear la comida con opción
            $comida = $this->mealOptionService->agregarOpcionComida($diaId, $request->tipo_comida, [
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'instrucciones' => $request->instrucciones,
                'hora_recomendada' => $request->hora_recomendada,
                'nombre_opcion' => $request->nombre_opcion,
                'orden' => 1
            ]);

            // Agregar alimentos si se proporcionaron
            if ($request->has('alimentos') && is_array($request->alimentos)) {
                foreach ($request->alimentos as $alimentoData) {
                    $comida->alimentos()->attach($alimentoData['id'], [
                        'cantidad_gramos' => $alimentoData['cantidad']
                    ]);
                }
            }

            // Agregar recetas si se proporcionaron
            if ($request->has('recetas') && is_array($request->recetas)) {
                $comida->recetas()->attach($request->recetas);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Opción de comida agregada exitosamente',
                'data' => $comida->load(['alimentos', 'recetas'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al agregar opción de comida: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar la opción de comida'
            ], 500);
        }
    }

    /**
     * Obtener todas las opciones de un turno específico
     */
    public function obtenerOpcionesComida($planId, $diaId, $tipoComida)
    {
        try {
            // Verificar que el plan pertenece al usuario
            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', auth()->id())
                ->firstOrFail();

            // Verificar que el día pertenece al plan
            $dia = PlanDia::where('id_dia', $diaId)
                ->where('id_plan', $planId)
                ->firstOrFail();

            $opciones = $this->mealOptionService->obtenerOpciones($diaId, $tipoComida);

            return response()->json([
                'success' => true,
                'data' => $opciones
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al obtener opciones de comida: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las opciones de comida'
            ], 500);
        }
    }

    /**
     * Eliminar una opción de comida
     */
    public function eliminarOpcionComida($planId, $diaId, $comidaId)
    {
        try {
            // Verificar que el plan pertenece al usuario
            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', auth()->id())
                ->firstOrFail();

            // Verificar que la comida pertenece al día y plan
            $comida = Comida::where('id_comida', $comidaId)
                ->where('id_dia', $diaId)
                ->firstOrFail();

            $this->mealOptionService->eliminarOpcion($comidaId);

            return response()->json([
                'success' => true,
                'message' => 'Opción de comida eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar opción de comida: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la opción de comida'
            ], 500);
        }
    }

    /**
     * Reordenar opciones de comida
     */
    public function reordenarOpciones(Request $request, $planId, $diaId, $tipoComida)
    {
        try {
            $request->validate([
                'orden_ids' => 'required|array|min:1|max:2',
                'orden_ids.*' => 'required|exists:comidas,id_comida'
            ]);

            // Verificar que el plan pertenece al usuario
            $plan = PlanAlimentacion::where('id_plan', $planId)
                ->where('id_nutricionista', auth()->id())
                ->firstOrFail();

            // Verificar que el día pertenece al plan
            $dia = PlanDia::where('id_dia', $diaId)
                ->where('id_plan', $planId)
                ->firstOrFail();

            $this->mealOptionService->reordenarOpciones($diaId, $tipoComida, $request->orden_ids);

            return response()->json([
                'success' => true,
                'message' => 'Opciones reordenadas exitosamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al reordenar opciones: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al reordenar las opciones'
            ], 500);
        }
    }

}
