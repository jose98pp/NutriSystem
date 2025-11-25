<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalendarioEntrega;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CalendarioEntregaController extends Controller
{
    /**
     * Listar calendarios de entrega
     */
    public function index(Request $request)
    {
        $query = CalendarioEntrega::with(['contrato.paciente', 'entregas']);

        // Filtro por contrato
        if ($request->has('id_contrato')) {
            $query->where('id_contrato', $request->id_contrato);
        }

        $calendarios = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $calendarios
        ]);
    }

    /**
     * Mostrar un calendario específico
     */
    public function show($id)
    {
        $calendario = CalendarioEntrega::with(['contrato.paciente', 'entregas'])->find($id);

        if (!$calendario) {
            return response()->json([
                'success' => false,
                'message' => 'Calendario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $calendario
        ]);
    }

    /**
     * Crear un calendario de entrega
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_contrato' => 'required|exists:contratos,id_contrato|unique:calendario_entrega,id_contrato',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $calendario = CalendarioEntrega::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Calendario de entrega creado exitosamente',
            'data' => $calendario->load('contrato.paciente')
        ], 201);
    }

    /**
     * Actualizar un calendario de entrega
     */
    public function update(Request $request, $id)
    {
        $calendario = CalendarioEntrega::find($id);

        if (!$calendario) {
            return response()->json([
                'success' => false,
                'message' => 'Calendario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $calendario->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Calendario actualizado exitosamente',
            'data' => $calendario->load('contrato.paciente')
        ]);
    }

    /**
     * Eliminar un calendario de entrega
     */
    public function destroy($id)
    {
        $calendario = CalendarioEntrega::find($id);

        if (!$calendario) {
            return response()->json([
                'success' => false,
                'message' => 'Calendario no encontrado'
            ], 404);
        }

        $calendario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Calendario eliminado exitosamente'
        ]);
    }

    /**
     * Obtener calendario por contrato
     */
    public function byContrato($id_contrato)
    {
        $calendario = CalendarioEntrega::with('entregas')
            ->where('id_contrato', $id_contrato)
            ->first();

        if (!$calendario) {
            return response()->json([
                'success' => false,
                'message' => 'No existe calendario para este contrato'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $calendario
        ]);
    }

    /**
     * Obtener calendarios activos
     */
    public function activos()
    {
        $calendarios = CalendarioEntrega::with(['contrato.paciente', 'entregas'])
            ->whereDate('fecha_inicio', '<=', now())
            ->whereDate('fecha_fin', '>=', now())
            ->get();

        return response()->json([
            'success' => true,
            'data' => $calendarios
        ]);
    }

    /**
     * Obtener el calendario del paciente autenticado
     */
    public function miCalendario(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }
        
        // Obtener calendario del contrato activo del paciente
        $calendario = CalendarioEntrega::whereHas('contrato', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente)
                  ->where('estado', 'ACTIVO');
        })->with([
            'contrato.paciente',
            'entregas' => function($query) {
                $query->orderBy('fecha', 'asc');
            },
            'entregas.direccion',
            'entregas.comida'
        ])->first();
        
        if (!$calendario) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No tienes un calendario de entregas activo'
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $calendario
        ]);
    }
}
