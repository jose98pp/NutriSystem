<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Direccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DireccionController extends Controller
{
    /**
     * Listar todas las direcciones de un paciente
     */
    public function index(Request $request)
    {
        $query = Direccion::with('paciente');

        // Filtrar por paciente si se proporciona
        if ($request->has('id_paciente')) {
            $query->where('id_paciente', $request->id_paciente);
        }

        $direcciones = $query->get();

        return response()->json([
            'success' => true,
            'data' => $direcciones
        ]);
    }

    /**
     * Mostrar una dirección específica
     */
    public function show($id)
    {
        $direccion = Direccion::with('paciente')->find($id);

        if (!$direccion) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $direccion
        ]);
    }

    /**
     * Crear una nueva dirección
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'alias' => 'required|string|max:50',
            'descripcion' => 'nullable|string',
            'geo_lat' => 'nullable|numeric|between:-90,90',
            'geo_lng' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $direccion = Direccion::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Dirección creada exitosamente',
            'data' => $direccion->load('paciente')
        ], 201);
    }

    /**
     * Actualizar una dirección
     */
    public function update(Request $request, $id)
    {
        $direccion = Direccion::find($id);

        if (!$direccion) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'alias' => 'sometimes|required|string|max:50',
            'descripcion' => 'nullable|string',
            'geo_lat' => 'nullable|numeric|between:-90,90',
            'geo_lng' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $direccion->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Dirección actualizada exitosamente',
            'data' => $direccion->load('paciente')
        ]);
    }

    /**
     * Eliminar una dirección
     */
    public function destroy($id)
    {
        $direccion = Direccion::find($id);

        if (!$direccion) {
            return response()->json([
                'success' => false,
                'message' => 'Dirección no encontrada'
            ], 404);
        }

        $direccion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dirección eliminada exitosamente'
        ]);
    }

    /**
     * Obtener direcciones por paciente
     */
    public function byPaciente($id_paciente)
    {
        $direcciones = Direccion::where('id_paciente', $id_paciente)->get();

        return response()->json([
            'success' => true,
            'data' => $direcciones
        ]);
    }

    /**
     * Obtener las direcciones del paciente autenticado
     */
    public function misDirecciones(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }
        
        $direcciones = Direccion::where('id_paciente', $paciente->id_paciente)->get();
        
        return response()->json([
            'success' => true,
            'data' => $direcciones
        ]);
    }
}
