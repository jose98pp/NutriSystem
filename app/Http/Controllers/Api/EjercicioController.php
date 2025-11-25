<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ejercicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EjercicioController extends Controller
{
    public function index(Request $request)
    {
        $query = Ejercicio::with('gruposMusculares')->activos();

        if ($request->has('grupo_muscular')) {
            $query->porGrupoMuscular($request->grupo_muscular);
        }

        if ($request->has('nivel')) {
            $query->porNivel($request->nivel);
        }

        if ($request->has('tipo')) {
            $query->porTipo($request->tipo);
        }

        if ($request->has('search')) {
            $query->buscar($request->search);
        }

        $ejercicios = $query->paginate(20);
        return response()->json($ejercicios);
    }

    public function show($id)
    {
        $ejercicio = Ejercicio::with(['gruposMusculares', 'creador'])->findOrFail($id);
        return response()->json($ejercicio);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:200',
            'descripcion' => 'required|string',
            'instrucciones' => 'required|string',
            'nivel_dificultad' => 'required|in:principiante,intermedio,avanzado',
            'tipo_ejercicio' => 'required|in:fuerza,cardio,flexibilidad,equilibrio',
            'grupos_musculares' => 'required|array|min:1',
            'grupos_musculares.*' => 'exists:grupos_musculares,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ejercicio = Ejercicio::create(array_merge(
            $request->except('grupos_musculares'),
            ['created_by' => auth()->id()]
        ));

        // Vincular grupos musculares
        foreach ($request->grupos_musculares as $index => $grupoId) {
            $ejercicio->gruposMusculares()->attach($grupoId, [
                'es_principal' => $index === 0
            ]);
        }

        return response()->json($ejercicio->load('gruposMusculares'), 201);
    }

    public function update(Request $request, $id)
    {
        $ejercicio = Ejercicio::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:200',
            'descripcion' => 'string',
            'instrucciones' => 'string',
            'nivel_dificultad' => 'in:principiante,intermedio,avanzado',
            'tipo_ejercicio' => 'in:fuerza,cardio,flexibilidad,equilibrio',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ejercicio->update($request->except('grupos_musculares'));

        if ($request->has('grupos_musculares')) {
            $ejercicio->gruposMusculares()->detach();
            foreach ($request->grupos_musculares as $index => $grupoId) {
                $ejercicio->gruposMusculares()->attach($grupoId, [
                    'es_principal' => $index === 0
                ]);
            }
        }

        return response()->json($ejercicio->load('gruposMusculares'));
    }

    public function destroy($id)
    {
        $ejercicio = Ejercicio::findOrFail($id);

        // Verificar si está en uso
        $enUso = $ejercicio->rutinas()->where('activo', true)->count();
        if ($enUso > 0) {
            return response()->json([
                'message' => "No se puede eliminar. El ejercicio está siendo usado en {$enUso} rutinas activas"
            ], 409);
        }

        $ejercicio->delete();
        return response()->json(['message' => 'Ejercicio eliminado correctamente']);
    }

    public function byGrupoMuscular($grupoId)
    {
        $ejercicios = Ejercicio::with('gruposMusculares')
            ->activos()
            ->porGrupoMuscular($grupoId)
            ->get();

        return response()->json($ejercicios);
    }

    public function search(Request $request)
    {
        $termino = $request->input('q', '');
        
        $ejercicios = Ejercicio::with('gruposMusculares')
            ->activos()
            ->buscar($termino)
            ->limit(10)
            ->get();

        return response()->json($ejercicios);
    }

    public function uploadMedia(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,jpeg,png,mp4|max:51200',
            'tipo' => 'required|in:imagen,video'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->file('file')->store('ejercicios', 'public');
        
        return response()->json([
            'url' => Storage::url($path),
            'path' => $path
        ]);
    }
}
