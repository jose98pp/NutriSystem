<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluacion;
use App\Models\Medicion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvaluacionController extends Controller
{
    /**
     * Listar evaluaciones
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Evaluacion::with(['paciente', 'nutricionista', 'medicion']);
        
        // Si es paciente, solo ver sus evaluaciones
        if ($user->isPaciente()) {
            $paciente = $user->paciente;
            if (!$paciente) {
                return response()->json([
                    'data' => [],
                    'total' => 0
                ]);
            }
            $query->where('id_paciente', $paciente->id_paciente);
        }
        
        // Si es nutricionista, solo ver evaluaciones de sus pacientes
        if ($user->isNutricionista()) {
            $nutricionista = $user->nutricionista;
            if ($nutricionista) {
                // Filtrar por pacientes asignados al nutricionista
                $query->whereHas('paciente', function($q) use ($nutricionista) {
                    $q->where('id_nutricionista', $nutricionista->id_nutricionista);
                });
            }
        }
        
        // Filtrar por paciente específico (admin/nutricionista)
        if ($request->has('paciente_id') && !$user->isPaciente()) {
            $query->where('id_paciente', $request->paciente_id);
        }
        
        // Filtrar por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        $evaluaciones = $query->orderBy('fecha', 'desc')->paginate(15);
        
        return response()->json($evaluaciones);
    }

    /**
     * Crear nueva evaluación
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'id_nutricionista' => 'required|exists:nutricionistas,id_nutricionista',
            'tipo' => 'required|in:INICIAL,PERIODICA,FINAL',
            'fecha' => 'required|date',
            'observaciones' => 'nullable|string',
            'medicion' => 'required|array',
            'medicion.peso_kg' => 'required|numeric|min:20|max:300',
            'medicion.altura_m' => 'required|numeric|min:0.5|max:2.5',
            'medicion.porc_grasa' => 'nullable|numeric|min:0|max:100',
            'medicion.masa_magra_kg' => 'nullable|numeric|min:0',
        ]);

        // Validar que solo haya una evaluación INICIAL por paciente
        if ($request->tipo === 'INICIAL') {
            $existeInicial = Evaluacion::where('id_paciente', $request->id_paciente)
                                      ->where('tipo', 'INICIAL')
                                      ->exists();
            if ($existeInicial) {
                return response()->json([
                    'message' => 'El paciente ya tiene una evaluación INICIAL'
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            // Crear evaluación
            $evaluacion = Evaluacion::create([
                'id_paciente' => $request->id_paciente,
                'id_nutricionista' => $request->id_nutricionista,
                'tipo' => $request->tipo,
                'fecha' => $request->fecha,
                'observaciones' => $request->observaciones,
            ]);

            // Crear medición
            $medicion = Medicion::create([
                'id_evaluacion' => $evaluacion->id_evaluacion,
                'peso_kg' => $request->medicion['peso_kg'],
                'altura_m' => $request->medicion['altura_m'],
                'porc_grasa' => $request->medicion['porc_grasa'] ?? null,
                'masa_magra_kg' => $request->medicion['masa_magra_kg'] ?? null,
            ]);

            DB::commit();

            // Calcular IMC
            $medicion->imc = $medicion->imc;
            $medicion->clasificacion_imc = $medicion->clasificacion_imc;

            return response()->json([
                'message' => 'Evaluación registrada exitosamente',
                'evaluacion' => $evaluacion->load(['paciente', 'nutricionista', 'medicion'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear la evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar evaluación específica
     */
    public function show($id)
    {
        $evaluacion = Evaluacion::with(['paciente', 'nutricionista', 'medicion'])
                                ->findOrFail($id);
        
        // Agregar IMC calculado
        if ($evaluacion->medicion) {
            $evaluacion->medicion->imc = $evaluacion->medicion->imc;
            $evaluacion->medicion->clasificacion_imc = $evaluacion->medicion->clasificacion_imc;
        }
        
        return response()->json($evaluacion);
    }

    /**
     * Actualizar evaluación
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'observaciones' => 'nullable|string',
            'medicion' => 'sometimes|array',
            'medicion.peso_kg' => 'sometimes|numeric|min:20|max:300',
            'medicion.altura_m' => 'sometimes|numeric|min:0.5|max:2.5',
            'medicion.porc_grasa' => 'nullable|numeric|min:0|max:100',
            'medicion.masa_magra_kg' => 'nullable|numeric|min:0',
        ]);

        $evaluacion = Evaluacion::findOrFail($id);

        DB::beginTransaction();
        try {
            if ($request->has('observaciones')) {
                $evaluacion->update(['observaciones' => $request->observaciones]);
            }

            if ($request->has('medicion') && $evaluacion->medicion) {
                $evaluacion->medicion->update($request->medicion);
            }

            DB::commit();

            return response()->json([
                'message' => 'Evaluación actualizada exitosamente',
                'evaluacion' => $evaluacion->load('medicion')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar evaluación
     */
    public function destroy($id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $evaluacion->delete();

        return response()->json([
            'message' => 'Evaluación eliminada exitosamente'
        ]);
    }

    /**
     * Obtener historial de evaluaciones de un paciente
     */
    public function historialPaciente($pacienteId)
    {
        $evaluaciones = Evaluacion::where('id_paciente', $pacienteId)
                                  ->with(['nutricionista', 'medicion'])
                                  ->orderBy('fecha', 'asc')
                                  ->get();

        // Calcular progreso
        $evaluaciones->transform(function($evaluacion, $index) use ($evaluaciones) {
            if ($evaluacion->medicion) {
                $evaluacion->medicion->imc = $evaluacion->medicion->imc;
                $evaluacion->medicion->clasificacion_imc = $evaluacion->medicion->clasificacion_imc;
                
                // Calcular variación de peso respecto a la evaluación anterior
                if ($index > 0 && $evaluaciones[$index - 1]->medicion) {
                    $pesoAnterior = $evaluaciones[$index - 1]->medicion->peso_kg;
                    $pesoActual = $evaluacion->medicion->peso_kg;
                    $evaluacion->variacion_peso = round($pesoActual - $pesoAnterior, 2);
                }
            }
            return $evaluacion;
        });

        return response()->json($evaluaciones);
    }

    /**
     * Obtener pacientes del nutricionista para formulario de evaluación
     */
    public function getPacientesNutricionista(Request $request)
    {
        $user = $request->user();
        
        // Si es nutricionista, obtener solo sus pacientes
        if ($user->isNutricionista()) {
            $nutricionista = $user->nutricionista;
            if (!$nutricionista) {
                return response()->json([]);
            }
            
            $search = $request->get('search', '');
            
            $pacientes = \App\Models\Paciente::where('id_nutricionista', $nutricionista->id_nutricionista)
                ->when($search, function($query) use ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%")
                          ->orWhere('apellido', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->with('nutricionista:id_nutricionista,nombre,apellido')
                ->select('id_paciente', 'nombre', 'apellido', 'email', 'id_nutricionista')
                ->orderBy('nombre')
                ->limit(20)
                ->get();
            
            return response()->json($pacientes);
        }
        
        // Si es admin, obtener todos los pacientes
        if ($user->isAdmin()) {
            $search = $request->get('search', '');
            
            $pacientes = \App\Models\Paciente::when($search, function($query) use ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('nombre', 'like', "%{$search}%")
                          ->orWhere('apellido', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->with('nutricionista:id_nutricionista,nombre,apellido')
                ->select('id_paciente', 'nombre', 'apellido', 'email', 'id_nutricionista')
                ->orderBy('nombre')
                ->limit(20)
                ->get();
            
            return response()->json($pacientes);
        }
        
        return response()->json([]);
    }

    /**
     * Crear evaluación inicial por paciente autenticado (onboarding)
     */
    public function storeInicialPaciente(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente ?? null;
        if (!$paciente) {
            return response()->json([
                'message' => 'No eres un paciente registrado'
            ], 403);
        }

        $request->validate([
            'id_nutricionista' => 'required|exists:nutricionistas,id_nutricionista',
            'observaciones' => 'nullable|string',
            'medicion' => 'required|array',
            'medicion.peso_kg' => 'required|numeric|min:20|max:300',
            'medicion.altura_m' => 'required|numeric|min:0.5|max:2.5',
            'medicion.porc_grasa' => 'nullable|numeric|min:0|max:100',
            'medicion.masa_magra_kg' => 'nullable|numeric|min:0',
        ]);

        $existeInicial = Evaluacion::where('id_paciente', $paciente->id_paciente)
            ->where('tipo', 'INICIAL')
            ->exists();
        if ($existeInicial) {
            return response()->json([
                'message' => 'Ya tienes una evaluación INICIAL registrada'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $evaluacion = Evaluacion::create([
                'id_paciente' => $paciente->id_paciente,
                'id_nutricionista' => $request->id_nutricionista,
                'tipo' => 'INICIAL',
                'fecha' => now()->toDateString(),
                'observaciones' => $request->observaciones,
            ]);

            $medicion = Medicion::create([
                'id_evaluacion' => $evaluacion->id_evaluacion,
                'peso_kg' => $request->medicion['peso_kg'],
                'altura_m' => $request->medicion['altura_m'],
                'porc_grasa' => $request->medicion['porc_grasa'] ?? null,
                'masa_magra_kg' => $request->medicion['masa_magra_kg'] ?? null,
            ]);

            DB::commit();

            $medicion->imc = $medicion->imc;
            $medicion->clasificacion_imc = $medicion->clasificacion_imc;

            return response()->json([
                'message' => 'Evaluación inicial registrada',
                'evaluacion' => $evaluacion->load(['paciente', 'nutricionista', 'medicion'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar la evaluación inicial',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
