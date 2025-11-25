<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EntregaProgramada;
use App\Models\CalendarioEntrega;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class EntregaProgramadaController extends Controller
{
    /**
     * Listar entregas programadas
     */
    public function index(Request $request)
    {
        $query = EntregaProgramada::with(['calendario.contrato.paciente', 'direccion', 'comida']);

        // Filtro por calendario
        if ($request->has('id_calendario')) {
            $query->where('id_calendario', $request->id_calendario);
        }

        // Filtro por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Filtro por rango de fechas
        if ($request->has('fecha_desde')) {
            $query->where('fecha', '>=', $request->fecha_desde);
        }
        if ($request->has('fecha_hasta')) {
            $query->where('fecha', '<=', $request->fecha_hasta);
        }

        // Ordenar por fecha
        $query->orderBy('fecha', 'asc');

        $entregas = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $entregas
        ]);
    }

    /**
     * Mostrar una entrega específica con comidas de la semana
     */
    public function show($id)
    {
        $entrega = EntregaProgramada::with([
            'calendario.contrato.paciente', 
            'calendario.contrato.plan.planDias.comidas.alimentos',
            'direccion', 
            'comida'
        ])->find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada'
            ], 404);
        }

        // Obtener las comidas de la semana de esta entrega
        $fechaEntrega = Carbon::parse($entrega->fecha);
        $semanaInicio = $fechaEntrega->copy()->startOfDay();
        $semanaFin = $fechaEntrega->copy()->addDays(6)->endOfDay();
        
        $comidasSemana = [];
        $totalesSemana = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
            'total_comidas' => 0
        ];

        if ($entrega->calendario && $entrega->calendario->contrato && $entrega->calendario->contrato->plan) {
            $plan = $entrega->calendario->contrato->plan;
            
            // Obtener días del plan que caen en esta semana
            $diasPlan = $plan->planDias()
                ->whereBetween('fecha', [$semanaInicio, $semanaFin])
                ->with(['comidas.alimentos'])
                ->orderBy('fecha')
                ->get();

            foreach ($diasPlan as $dia) {
                $comidasDelDia = [];
                $totalesDia = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];

                foreach ($dia->comidas as $comida) {
                    $totalesComida = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];
                    
                    foreach ($comida->alimentos as $alimento) {
                        $cantidad = $alimento->pivot->cantidad_gramos ?? 0;
                        $factor = $cantidad / 100;
                        
                        $totalesComida['calorias'] += ($alimento->calorias_por_100g ?? 0) * $factor;
                        $totalesComida['proteinas'] += ($alimento->proteinas_por_100g ?? 0) * $factor;
                        $totalesComida['carbohidratos'] += ($alimento->carbohidratos_por_100g ?? 0) * $factor;
                        $totalesComida['grasas'] += ($alimento->grasas_por_100g ?? 0) * $factor;
                    }

                    $comida->totales = $totalesComida;
                    $totalesDia['calorias'] += $totalesComida['calorias'];
                    $totalesDia['proteinas'] += $totalesComida['proteinas'];
                    $totalesDia['carbohidratos'] += $totalesComida['carbohidratos'];
                    $totalesDia['grasas'] += $totalesComida['grasas'];
                    
                    $comidasDelDia[] = $comida;
                }

                $comidasSemana[] = [
                    'fecha' => $dia->fecha,
                    'dia_semana' => $dia->dia_semana,
                    'dia_numero' => $dia->dia_numero,
                    'comidas' => $comidasDelDia,
                    'totales_dia' => $totalesDia
                ];

                $totalesSemana['calorias'] += $totalesDia['calorias'];
                $totalesSemana['proteinas'] += $totalesDia['proteinas'];
                $totalesSemana['carbohidratos'] += $totalesDia['carbohidratos'];
                $totalesSemana['grasas'] += $totalesDia['grasas'];
                $totalesSemana['total_comidas'] += count($comidasDelDia);
            }
        }

        $entrega->comidas_semana = $comidasSemana;
        $entrega->totales_semana = $totalesSemana;

        return response()->json([
            'success' => true,
            'data' => $entrega
        ]);
    }

    /**
     * Crear una entrega programada
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|exists:calendario_entrega,id_calendario',
            'id_direccion' => 'required|exists:direcciones,id_direccion',
            'id_comida' => 'nullable|exists:comidas,id_comida',
            'fecha' => 'required|date',
            'estado' => 'required|in:PROGRAMADA,OMITIDA,ENTREGADA,PENDIENTE',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que la fecha esté dentro del rango del calendario
        $calendario = CalendarioEntrega::find($request->id_calendario);
        $fecha = Carbon::parse($request->fecha);

        if (!$fecha->between($calendario->fecha_inicio, $calendario->fecha_fin)) {
            return response()->json([
                'success' => false,
                'message' => 'La fecha debe estar dentro del rango del calendario'
            ], 422);
        }

        $entrega = EntregaProgramada::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Entrega programada creada exitosamente',
            'data' => $entrega->load(['calendario', 'direccion', 'comida'])
        ], 201);
    }

    /**
     * Actualizar una entrega programada
     */
    public function update(Request $request, $id)
    {
        $entrega = EntregaProgramada::find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_direccion' => 'sometimes|required|exists:direcciones,id_direccion',
            'id_comida' => 'nullable|exists:comidas,id_comida',
            'fecha' => 'sometimes|required|date',
            'estado' => 'sometimes|required|in:PROGRAMADA,OMITIDA,ENTREGADA,PENDIENTE',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $entrega->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Entrega actualizada exitosamente',
            'data' => $entrega->load(['calendario', 'direccion', 'comida'])
        ]);
    }

    /**
     * Eliminar una entrega programada
     */
    public function destroy($id)
    {
        $entrega = EntregaProgramada::find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada'
            ], 404);
        }

        $entrega->delete();

        return response()->json([
            'success' => true,
            'message' => 'Entrega eliminada exitosamente'
        ]);
    }

    /**
     * Marcar entrega como entregada
     */
    public function marcarComoEntregada($id)
    {
        $entrega = EntregaProgramada::find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada'
            ], 404);
        }

        $entrega->marcarComoEntregada();

        return response()->json([
            'success' => true,
            'message' => 'Entrega marcada como entregada',
            'data' => $entrega
        ]);
    }

    /**
     * Marcar entrega como omitida
     */
    public function marcarComoOmitida($id)
    {
        $entrega = EntregaProgramada::find($id);

        if (!$entrega) {
            return response()->json([
                'success' => false,
                'message' => 'Entrega no encontrada'
            ], 404);
        }

        $entrega->marcarComoOmitida();

        return response()->json([
            'success' => true,
            'message' => 'Entrega marcada como omitida',
            'data' => $entrega
        ]);
    }

    /**
     * Obtener entregas del día
     */
    public function entregasDelDia(Request $request)
    {
        $fecha = $request->get('fecha', Carbon::today()->toDateString());

        $entregas = EntregaProgramada::with(['calendario.contrato.paciente', 'direccion', 'comida'])
            ->where('fecha', $fecha)
            ->orderBy('id_calendario')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $entregas
        ]);
    }

    /**
     * Obtener entregas pendientes
     */
    public function entregasPendientes()
    {
        $entregas = EntregaProgramada::with(['calendario.contrato.paciente', 'direccion', 'comida'])
            ->pendientes()
            ->where('fecha', '<=', Carbon::today())
            ->orderBy('fecha', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $entregas
        ]);
    }

    /**
     * Generar entregas automáticamente para un calendario
     */
    public function generarEntregas(Request $request, $id_calendario)
    {
        $calendario = CalendarioEntrega::with('contrato.paciente.direcciones')->find($id_calendario);

        if (!$calendario) {
            return response()->json([
                'success' => false,
                'message' => 'Calendario no encontrado'
            ], 404);
        }

        // Obtener la primera dirección del paciente
        $direccion = $calendario->contrato->paciente->direcciones->first();

        if (!$direccion) {
            return response()->json([
                'success' => false,
                'message' => 'El paciente no tiene direcciones registradas'
            ], 422);
        }

        $fechaInicio = $calendario->fecha_inicio;
        $fechaFin = $calendario->fecha_fin;
        $entregas = [];

        // Generar entregas para cada día
        for ($fecha = $fechaInicio; $fecha->lte($fechaFin); $fecha->addDay()) {
            // Verificar si ya existe una entrega para esta fecha
            $existe = EntregaProgramada::where('id_calendario', $id_calendario)
                ->where('fecha', $fecha)
                ->exists();

            if (!$existe) {
                $entrega = EntregaProgramada::create([
                    'id_calendario' => $id_calendario,
                    'id_direccion' => $direccion->id_direccion,
                    'fecha' => $fecha->toDateString(),
                    'estado' => EntregaProgramada::ESTADO_PROGRAMADA,
                ]);
                $entregas[] = $entrega;
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($entregas) . ' entregas generadas exitosamente',
            'data' => $entregas
        ]);
    }

    /**
     * Obtener todas las entregas del paciente autenticado
     */
    public function misEntregas(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }
        
        $entregas = EntregaProgramada::whereHas('calendario.contrato', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente);
        })->with(['direccion', 'comida', 'calendario.contrato'])
          ->orderBy('fecha', 'desc')
          ->get();
        
        return response()->json([
            'success' => true,
            'data' => $entregas
        ]);
    }

    /**
     * Obtener las próximas entregas del paciente autenticado
     */
    public function proximasEntregas(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }
        
        $entregas = EntregaProgramada::whereHas('calendario.contrato', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente);
        })->where('fecha', '>=', now()->toDateString())
          ->whereIn('estado', [EntregaProgramada::ESTADO_PROGRAMADA, EntregaProgramada::ESTADO_PENDIENTE])
          ->with(['direccion', 'comida', 'calendario.contrato'])
          ->orderBy('fecha', 'asc')
          ->take(7)
          ->get();
        
        return response()->json([
            'success' => true,
            'data' => $entregas
        ]);
    }
}
