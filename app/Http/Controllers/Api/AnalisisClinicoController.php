<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalisisClinico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalisisClinicoController extends Controller
{
    /**
     * Listar análisis clínicos
     */
    public function index(Request $request)
    {
        $query = AnalisisClinico::with('evaluaciones');

        // Filtro por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', 'like', '%' . $request->tipo . '%');
        }

        $analisis = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $analisis
        ]);
    }

    /**
     * Mostrar un análisis específico
     */
    public function show($id)
    {
        $analisis = AnalisisClinico::with('evaluaciones')->find($id);

        if (!$analisis) {
            return response()->json([
                'success' => false,
                'message' => 'Análisis clínico no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $analisis
        ]);
    }

    /**
     * Crear un análisis clínico
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipo' => 'required|string|max:100',
            'resultado' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $analisis = AnalisisClinico::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Análisis clínico creado exitosamente',
            'data' => $analisis
        ], 201);
    }

    /**
     * Actualizar un análisis clínico
     */
    public function update(Request $request, $id)
    {
        $analisis = AnalisisClinico::find($id);

        if (!$analisis) {
            return response()->json([
                'success' => false,
                'message' => 'Análisis clínico no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tipo' => 'sometimes|required|string|max:100',
            'resultado' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $analisis->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Análisis clínico actualizado exitosamente',
            'data' => $analisis
        ]);
    }

    /**
     * Eliminar un análisis clínico
     */
    public function destroy($id)
    {
        $analisis = AnalisisClinico::find($id);

        if (!$analisis) {
            return response()->json([
                'success' => false,
                'message' => 'Análisis clínico no encontrado'
            ], 404);
        }

        $analisis->delete();

        return response()->json([
            'success' => true,
            'message' => 'Análisis clínico eliminado exitosamente'
        ]);
    }

    /**
     * Vincular análisis a evaluación
     */
    public function attachToEvaluacion(Request $request, $id)
    {
        $analisis = AnalisisClinico::find($id);

        if (!$analisis) {
            return response()->json([
                'success' => false,
                'message' => 'Análisis clínico no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_evaluacion' => 'required|exists:evaluaciones,id_evaluacion',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $analisis->evaluaciones()->attach($request->id_evaluacion);

        return response()->json([
            'success' => true,
            'message' => 'Análisis vinculado a la evaluación exitosamente'
        ]);
    }

    /**
     * Desvincular análisis de evaluación
     */
    public function detachFromEvaluacion($id, $id_evaluacion)
    {
        $analisis = AnalisisClinico::find($id);

        if (!$analisis) {
            return response()->json([
                'success' => false,
                'message' => 'Análisis clínico no encontrado'
            ], 404);
        }

        $analisis->evaluaciones()->detach($id_evaluacion);

        return response()->json([
            'success' => true,
            'message' => 'Análisis desvinculado de la evaluación exitosamente'
        ]);
    }

    /**
     * Obtener los análisis clínicos del paciente autenticado
     */
    public function misAnalisis(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }
        
        // Obtener análisis vinculados a evaluaciones del paciente
        $analisis = AnalisisClinico::whereHas('evaluaciones', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente);
        })->with(['evaluaciones' => function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente);
        }])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $analisis
        ]);
    }
}
