<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alimento;
use App\Services\AlimentoUsageChecker;
use Illuminate\Http\Request;

class AlimentoController extends Controller
{
    protected $usageChecker;

    public function __construct(AlimentoUsageChecker $usageChecker)
    {
        $this->usageChecker = $usageChecker;
    }
    /**
     * Listar alimentos con búsqueda y filtros avanzados
     */
    public function index(Request $request)
    {
        $query = Alimento::query();
        
        // Búsqueda por nombre
        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }
        
        // Filtro por categoría
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        
        // Filtro por disponibilidad
        if ($request->has('disponible')) {
            $query->where('disponible', $request->boolean('disponible'));
        }
        
        // Filtro por restricciones
        if ($request->has('restricciones')) {
            $query->where('restricciones', 'like', '%' . $request->restricciones . '%');
        }
        
        // Filtro por rango de calorías
        if ($request->has('calorias_min')) {
            $query->where('calorias_por_100g', '>=', $request->calorias_min);
        }
        if ($request->has('calorias_max')) {
            $query->where('calorias_por_100g', '<=', $request->calorias_max);
        }
        
        // Filtro por rango de proteínas
        if ($request->has('proteinas_min')) {
            $query->where('proteinas_por_100g', '>=', $request->proteinas_min);
        }
        if ($request->has('proteinas_max')) {
            $query->where('proteinas_por_100g', '<=', $request->proteinas_max);
        }
        
        // Ordenamiento
        $sortBy = $request->get('sort_by', 'nombre');
        $sortOrder = $request->get('sort_order', 'asc');
        
        $allowedSortFields = ['nombre', 'categoria', 'calorias_por_100g', 'proteinas_por_100g', 'carbohidratos_por_100g', 'grasas_por_100g'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }
        
        $perPage = $request->get('per_page', 20);
        $alimentos = $query->paginate($perPage);
        
        return response()->json($alimentos);
    }

    /**
     * Registrar nuevo alimento con validaciones completas
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:150|unique:alimentos,nombre',
            'categoria' => 'required|in:fruta,verdura,cereal,proteina,lacteo,grasa,otro',
            'calorias_por_100g' => 'required|numeric|min:0',
            'proteinas_por_100g' => 'required|numeric|min:0',
            'carbohidratos_por_100g' => 'required|numeric|min:0',
            'grasas_por_100g' => 'required|numeric|min:0',
            'fibra_por_100g' => 'nullable|numeric|min:0',
            'sodio_por_100g' => 'nullable|numeric|min:0',
            'azucares_por_100g' => 'nullable|numeric|min:0',
            'grasas_saturadas_por_100g' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string|max:500',
            'unidad_medida' => 'nullable|string|max:50',
            'disponible' => 'nullable|boolean',
        ]);

        $alimento = Alimento::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Alimento registrado exitosamente',
            'alimento' => $alimento
        ], 201);
    }

    /**
     * Mostrar alimento específico con información completa
     */
    public function show($id)
    {
        $alimento = Alimento::findOrFail($id);
        
        // Obtener información de uso
        $usageInfo = $this->usageChecker->checkUsage($id);
        
        return response()->json([
            'alimento' => $alimento,
            'uso' => $usageInfo
        ]);
    }

    /**
     * Actualizar alimento con validaciones completas
     */
    public function update(Request $request, $id)
    {
        $alimento = Alimento::findOrFail($id);
        
        $request->validate([
            'nombre' => 'sometimes|string|max:150|unique:alimentos,nombre,' . $id . ',id_alimento',
            'categoria' => 'sometimes|in:fruta,verdura,cereal,proteina,lacteo,grasa,otro',
            'calorias_por_100g' => 'sometimes|numeric|min:0',
            'proteinas_por_100g' => 'sometimes|numeric|min:0',
            'carbohidratos_por_100g' => 'sometimes|numeric|min:0',
            'grasas_por_100g' => 'sometimes|numeric|min:0',
            'fibra_por_100g' => 'nullable|numeric|min:0',
            'sodio_por_100g' => 'nullable|numeric|min:0',
            'azucares_por_100g' => 'nullable|numeric|min:0',
            'grasas_saturadas_por_100g' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string|max:500',
            'unidad_medida' => 'nullable|string|max:50',
            'disponible' => 'nullable|boolean',
        ]);

        $alimento->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Alimento actualizado exitosamente',
            'alimento' => $alimento
        ]);
    }

    /**
     * Eliminar alimento con verificación de uso
     */
    public function destroy($id)
    {
        $alimento = Alimento::findOrFail($id);
        
        // Verificar si el alimento está en uso
        $usageInfo = $this->usageChecker->checkUsage($id);
        
        if ($usageInfo['en_uso']) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el alimento porque está en uso',
                'uso' => $usageInfo
            ], 422);
        }
        
        $alimento->delete();

        return response()->json([
            'success' => true,
            'message' => 'Alimento eliminado exitosamente'
        ]);
    }
}
