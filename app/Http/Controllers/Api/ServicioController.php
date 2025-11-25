<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServicioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $servicios = Servicio::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $servicios
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error obteniendo servicios: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno al obtener servicios'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'tipo_servicio' => 'required|in:plan_alimenticio,asesoramiento,catering',
            'duracion_dias' => 'required|integer|min:1',
            'costo' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $servicio = Servicio::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Servicio creado exitosamente',
            'data' => $servicio
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $servicio
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100',
            'tipo_servicio' => 'sometimes|required|in:plan_alimenticio,asesoramiento,catering',
            'duracion_dias' => 'sometimes|required|integer|min:1',
            'costo' => 'sometimes|required|numeric|min:0',
            'descripcion' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $servicio->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Servicio actualizado exitosamente',
            'data' => $servicio
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        // Check if servicio has contratos
        if ($servicio->contratos()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el servicio porque tiene contratos asociados'
            ], 400);
        }

        $servicio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Servicio eliminado exitosamente'
        ]);
    }
}
