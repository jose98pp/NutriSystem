<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecetaGeneratorService;
use App\Services\AlimentoCombinationService;
use App\Models\Paciente;
use App\Models\Nutricionista;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Controlador para generación automática de recetas
 * Feature: mejoras-sistema-core, Tarea 6.3
 */
class RecetaGeneratorController extends Controller
{
    protected $recetaGenerator;
    protected $combinationService;
    
    public function __construct(
        RecetaGeneratorService $recetaGenerator,
        AlimentoCombinationService $combinationService
    ) {
        $this->recetaGenerator = $recetaGenerator;
        $this->combinationService = $combinationService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Generar receta automáticamente
     */
    public function generateRecipe(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'categoria' => 'required|in:desayuno,almuerzo,cena,merienda,postre,bebida,general',
                'calorias_objetivo' => 'nullable|numeric|min:50|max:2000',
                'proteinas_min' => 'nullable|numeric|min:0|max:100',
                'carbohidratos_max' => 'nullable|numeric|min:0|max:200',
                'grasas_max' => 'nullable|numeric|min:0|max:100',
                'restricciones' => 'nullable|array',
                'restricciones.*' => 'string|max:50',
                'dificultad_max' => 'nullable|in:facil,media,dificil',
                'tiempo_max' => 'nullable|integer|min:5|max:180',
                'porciones' => 'nullable|integer|min:1|max:10'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $criteria = $validator->validated();
            $recipeData = $this->recetaGenerator->generateRecipe($criteria);

            return response()->json([
                'success' => true,
                'message' => 'Receta generada exitosamente',
                'data' => $recipeData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la receta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar receta para un paciente específico
     */
    public function generateForPatient(Request $request, int $pacienteId): JsonResponse
    {
        try {
            // Verificar permisos
            $user = Auth::user();
            if ($user->role === 'paciente' && $user->paciente->id_paciente !== $pacienteId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para generar recetas para este paciente'
                ], 403);
            }

            $paciente = Paciente::findOrFail($pacienteId);

            $validator = Validator::make($request->all(), [
                'categoria' => 'nullable|in:desayuno,almuerzo,cena,merienda,postre,bebida,general',
                'preferencias' => 'nullable|array',
                'evitar_alimentos' => 'nullable|array',
                'evitar_alimentos.*' => 'integer|exists:alimentos,id_alimento'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $preferences = $validator->validated();
            $recipeData = $this->recetaGenerator->generateRecipeForPatient($paciente, $preferences);

            return response()->json([
                'success' => true,
                'message' => 'Receta personalizada generada exitosamente',
                'data' => $recipeData,
                'paciente' => [
                    'id' => $paciente->id_paciente,
                    'nombre' => $paciente->nombre . ' ' . $paciente->apellido
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la receta personalizada: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar variaciones de una receta
     */
    public function generateVariations(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'receta_base' => 'required|array',
                'receta_base.nombre' => 'required|string|max:200',
                'receta_base.alimentos' => 'required|array|min:2',
                'receta_base.alimentos.*.alimento' => 'required|array',
                'receta_base.alimentos.*.cantidad_gramos' => 'required|numeric|min:1',
                'cantidad_variaciones' => 'nullable|integer|min:1|max:5'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $baseRecipe = $request->input('receta_base');
            $count = $request->input('cantidad_variaciones', 3);

            $variations = $this->recetaGenerator->generateRecipeVariations($baseRecipe, $count);

            return response()->json([
                'success' => true,
                'message' => 'Variaciones generadas exitosamente',
                'data' => [
                    'receta_base' => $baseRecipe,
                    'variaciones' => $variations
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar variaciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Encontrar combinaciones óptimas de alimentos
     */
    public function findOptimalCombinations(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'categorias' => 'nullable|array',
                'categorias.*' => 'in:proteina,verdura,cereal,fruta,lacteo,grasa',
                'calorias_objetivo' => 'nullable|numeric|min:50|max:2000',
                'restricciones' => 'nullable|array',
                'restricciones.*' => 'string|max:50',
                'max_alimentos' => 'nullable|integer|min:2|max:8',
                'min_alimentos' => 'nullable|integer|min:2|max:5',
                'max_results' => 'nullable|integer|min:1|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $criteria = $validator->validated();
            $combinations = $this->combinationService->findOptimalCombinations($criteria);

            return response()->json([
                'success' => true,
                'message' => 'Combinaciones encontradas exitosamente',
                'data' => $combinations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar combinaciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar compatibilidad entre alimentos
     */
    public function checkCompatibility(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'alimentos' => 'required|array|min:2',
                'alimentos.*' => 'integer|exists:alimentos,id_alimento'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $alimentoIds = $request->input('alimentos');
            $alimentos = \App\Models\Alimento::whereIn('id_alimento', $alimentoIds)->get();

            $compatibility = $this->combinationService->checkFoodCompatibility($alimentos);

            return response()->json([
                'success' => true,
                'message' => 'Análisis de compatibilidad completado',
                'data' => $compatibility
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar compatibilidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sugerir alimentos complementarios
     */
    public function suggestComplementary(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'alimentos_base' => 'required|array|min:1',
                'alimentos_base.*' => 'integer|exists:alimentos,id_alimento',
                'calorias_objetivo' => 'nullable|numeric|min:50|max:2000',
                'proteinas_objetivo' => 'nullable|numeric|min:0|max:100',
                'carbohidratos_objetivo' => 'nullable|numeric|min:0|max:200',
                'grasas_objetivo' => 'nullable|numeric|min:0|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $alimentoIds = $request->input('alimentos_base');
            $baseAlimentos = \App\Models\Alimento::whereIn('id_alimento', $alimentoIds)->get();

            $criteria = [
                'calorias_objetivo' => $request->input('calorias_objetivo', 400),
                'proteinas_objetivo' => $request->input('proteinas_objetivo', 20),
                'carbohidratos_objetivo' => $request->input('carbohidratos_objetivo', 50),
                'grasas_objetivo' => $request->input('grasas_objetivo', 15)
            ];

            $suggestions = $this->combinationService->suggestComplementaryFoods($baseAlimentos, $criteria);

            return response()->json([
                'success' => true,
                'message' => 'Sugerencias generadas exitosamente',
                'data' => [
                    'alimentos_base' => $baseAlimentos,
                    'sugerencias' => $suggestions
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar sugerencias: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Optimizar proporciones de alimentos
     */
    public function optimizeProportions(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'alimentos' => 'required|array|min:2',
                'alimentos.*' => 'integer|exists:alimentos,id_alimento',
                'calorias' => 'required|numeric|min:50|max:2000',
                'proteinas' => 'nullable|numeric|min:0|max:100',
                'carbohidratos' => 'nullable|numeric|min:0|max:200',
                'grasas' => 'nullable|numeric|min:0|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $alimentoIds = $request->input('alimentos');
            $alimentos = \App\Models\Alimento::whereIn('id_alimento', $alimentoIds)->get();

            $targets = [
                'calorias' => $request->input('calorias'),
                'proteinas' => $request->input('proteinas', 20),
                'carbohidratos' => $request->input('carbohidratos', 50),
                'grasas' => $request->input('grasas', 15)
            ];

            $optimized = $this->combinationService->optimizeProportions($alimentos, $targets);

            return response()->json([
                'success' => true,
                'message' => 'Proporciones optimizadas exitosamente',
                'data' => $optimized
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al optimizar proporciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar receta generada
     */
    public function saveGeneratedRecipe(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Verificar que el usuario sea nutricionista
            if ($user->role !== 'nutricionista') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo los nutricionistas pueden guardar recetas'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:200',
                'descripcion' => 'required|string',
                'instrucciones_preparacion' => 'required|string',
                'tiempo_preparacion_minutos' => 'required|integer|min:1|max:300',
                'dificultad' => 'required|in:facil,media,dificil',
                'categoria' => 'required|in:desayuno,almuerzo,cena,merienda,postre,bebida,general',
                'porciones' => 'required|integer|min:1|max:10',
                'alimentos' => 'required|array|min:1',
                'alimentos.*.id_alimento' => 'required|integer|exists:alimentos,id_alimento',
                'alimentos.*.cantidad_gramos' => 'required|numeric|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $recipeData = $validator->validated();
            
            // Preparar datos para el servicio
            $alimentosData = [];
            foreach ($recipeData['alimentos'] as $alimentoData) {
                $alimento = \App\Models\Alimento::find($alimentoData['id_alimento']);
                $alimentosData[] = [
                    'alimento' => $alimento,
                    'cantidad_gramos' => $alimentoData['cantidad_gramos']
                ];
            }
            
            $recipeData['alimentos'] = $alimentosData;
            
            $nutricionista = $user->nutricionista;
            $receta = $this->recetaGenerator->saveGeneratedRecipe($recipeData, $nutricionista);

            return response()->json([
                'success' => true,
                'message' => 'Receta guardada exitosamente',
                'data' => $receta->load('alimentos')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar la receta: ' . $e->getMessage()
            ], 500);
        }
    }
}
