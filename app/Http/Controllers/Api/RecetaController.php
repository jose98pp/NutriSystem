<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecetaController extends Controller
{
    /**
     * Listar todas las recetas
     */
    public function index(Request $request)
    {
        $query = Receta::query();

        // Filtro de búsqueda por nombre
        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        // Filtro por restricciones
        if ($request->has('restricciones')) {
            $query->where('restricciones', 'like', '%' . $request->restricciones . '%');
        }

        // Paginación
        $perPage = $request->get('per_page', 15);
        $recetas = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $recetas
        ]);
    }

    /**
     * Mostrar una receta específica
     */
    public function show($id)
    {
        $receta = Receta::with('comidas')->find($id);

        if (!$receta) {
            return response()->json([
                'success' => false,
                'message' => 'Receta no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $receta
        ]);
    }

    /**
     * Crear una nueva receta
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|unique:recetas,nombre',
            'kcal' => 'nullable|integer|min:0',
            'restricciones' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $receta = Receta::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Receta creada exitosamente',
            'data' => $receta
        ], 201);
    }

    /**
     * Actualizar una receta
     */
    public function update(Request $request, $id)
    {
        $receta = Receta::find($id);

        if (!$receta) {
            return response()->json([
                'success' => false,
                'message' => 'Receta no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100|unique:recetas,nombre,' . $id . ',id_receta',
            'kcal' => 'nullable|integer|min:0',
            'restricciones' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $receta->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Receta actualizada exitosamente',
            'data' => $receta
        ]);
    }

    /**
     * Eliminar una receta
     */
    public function destroy($id)
    {
        $receta = Receta::find($id);

        if (!$receta) {
            return response()->json([
                'success' => false,
                'message' => 'Receta no encontrada'
            ], 404);
        }

        $receta->delete();

        return response()->json([
            'success' => true,
            'message' => 'Receta eliminada exitosamente'
        ]);
    }

    /**
     * Agregar receta a una comida
     */
    public function attachToComida(Request $request, $id)
    {
        $receta = Receta::find($id);

        if (!$receta) {
            return response()->json([
                'success' => false,
                'message' => 'Receta no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_comida' => 'required|exists:comidas,id_comida',
            'porciones' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $receta->comidas()->attach($request->id_comida, [
            'porciones' => $request->porciones
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receta agregada a la comida exitosamente'
        ]);
    }

    /**
     * Remover receta de una comida
     */
    public function detachFromComida($id, $id_comida)
    {
        $receta = Receta::find($id);

        if (!$receta) {
            return response()->json([
                'success' => false,
                'message' => 'Receta no encontrada'
            ], 404);
        }

        $receta->comidas()->detach($id_comida);

        return response()->json([
            'success' => true,
            'message' => 'Receta removida de la comida exitosamente'
        ]);
    }

    /**
     * Obtener las recetas del plan activo del paciente autenticado
     */
    public function misRecetas(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }
        
        // Obtener plan activo del paciente
        $planActivo = \App\Models\PlanAlimentacion::where('id_paciente', $paciente->id_paciente)
            ->where('fecha_inicio', '<=', now())
            ->where('fecha_fin', '>=', now())
            ->first();
        
        if (!$planActivo) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No tienes un plan de alimentación activo'
            ]);
        }
        
        // Obtener recetas de las comidas del plan
        $recetas = Receta::whereHas('comidas', function($query) use ($planActivo) {
            $query->where('id_plan', $planActivo->id_plan);
        })->distinct()->get();
        
        return response()->json([
            'success' => true,
            'data' => $recetas
        ]);
    }
}
