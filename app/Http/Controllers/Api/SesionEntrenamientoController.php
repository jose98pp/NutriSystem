<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SesionEntrenamiento;
use App\Models\SesionEjercicio;
use App\Services\ProgresoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SesionEntrenamientoController extends Controller
{
    protected $progresoService;

    public function __construct(ProgresoService $progresoService)
    {
        $this->progresoService = $progresoService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'Usuario no es paciente'], 403);
        }

        $query = SesionEntrenamiento::with(['rutinaPaciente.rutina', 'sesionEjercicios'])
            ->porPaciente($paciente->id_paciente);

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->entreFechas($request->fecha_inicio, $request->fecha_fin);
        }

        $sesiones = $query->orderBy('fecha', 'desc')->paginate(20);
        return response()->json($sesiones);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rutina_paciente_id' => 'required|exists:rutinas_pacientes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'Usuario no es paciente'], 403);
        }

        $sesion = SesionEntrenamiento::create([
            'rutina_paciente_id' => $request->rutina_paciente_id,
            'paciente_id' => $paciente->id_paciente,
            'fecha' => Carbon::now()->toDateString(),
            'hora_inicio' => Carbon::now(),
            'completada' => false,
            'porcentaje_completado' => 0,
        ]);

        $rutinaPaciente = $sesion->rutinaPaciente;
        if ($rutinaPaciente && $rutinaPaciente->rutina) {
            foreach ($rutinaPaciente->rutina->ejercicios as $ejercicio) {
                SesionEjercicio::create([
                    'sesion_entrenamiento_id' => $sesion->id,
                    'ejercicio_id' => $ejercicio->id,
                    'completado' => false,
                    'series_completadas' => 0,
                ]);
            }
        }

        return response()->json($sesion->load('sesionEjercicios.ejercicio'), 201);
    }

    public function update(Request $request, $id)
    {
        $sesion = SesionEntrenamiento::findOrFail($id);

        if ($request->has('ejercicios')) {
            foreach ($request->ejercicios as $ejercicioData) {
                $sesionEjercicio = SesionEjercicio::where('sesion_entrenamiento_id', $sesion->id)
                    ->where('ejercicio_id', $ejercicioData['ejercicio_id'])
                    ->first();

                if ($sesionEjercicio) {
                    $sesionEjercicio->update([
                        'completado' => $ejercicioData['completado'] ?? false,
                        'series_completadas' => $ejercicioData['series_completadas'] ?? 0,
                        'repeticiones_realizadas' => $ejercicioData['repeticiones_realizadas'] ?? null,
                        'peso_utilizado' => $ejercicioData['peso_utilizado'] ?? null,
                        'notas' => $ejercicioData['notas'] ?? null,
                    ]);
                }
            }

            $sesion->calcularPorcentajeCompletado();
        }

        if ($request->has('notas')) {
            $sesion->notas = $request->notas;
            $sesion->save();
        }

        return response()->json($sesion->load('sesionEjercicios.ejercicio'));
    }

    public function show($id)
    {
        $sesion = SesionEntrenamiento::with(['rutinaPaciente.rutina', 'sesionEjercicios.ejercicio'])->findOrFail($id);
        return response()->json($sesion);
    }

    public function marcarCompletada($id)
    {
        $sesion = SesionEntrenamiento::findOrFail($id);
        $sesion->marcarComoCompletada();

        return response()->json([
            'message' => 'Sesión completada correctamente',
            'sesion' => $sesion->load('sesionEjercicios')
        ]);
    }

    public function estadisticas(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'Usuario no es paciente'], 403);
        }

        $periodo = $request->input('periodo', 'mes');
        $estadisticas = $this->progresoService->calcularEstadisticas($paciente->id_paciente, $periodo);

        return response()->json($estadisticas);
    }

    public function sincronizar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sesiones' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $paciente = $user->paciente;
        if (!$paciente) {
            return response()->json(['message' => 'Usuario no es paciente'], 403);
        }
        $sincronizadas = [];

        foreach ($request->sesiones as $sesionData) {
            $sesion = SesionEntrenamiento::create([
                'rutina_paciente_id' => $sesionData['rutina_paciente_id'],
                'paciente_id' => $paciente->id_paciente,
                'fecha' => $sesionData['fecha'],
                'hora_inicio' => $sesionData['hora_inicio'],
                'hora_fin' => $sesionData['hora_fin'] ?? null,
                'duracion_minutos' => $sesionData['duracion_minutos'] ?? null,
                'completada' => $sesionData['completada'] ?? false,
                'porcentaje_completado' => $sesionData['porcentaje_completado'] ?? 0,
                'calorias_quemadas' => $sesionData['calorias_quemadas'] ?? null,
                'notas' => $sesionData['notas'] ?? null,
                'sincronizado' => true,
            ]);

            if (isset($sesionData['ejercicios'])) {
                foreach ($sesionData['ejercicios'] as $ejercicioData) {
                    SesionEjercicio::create([
                        'sesion_entrenamiento_id' => $sesion->id,
                        'ejercicio_id' => $ejercicioData['ejercicio_id'],
                        'completado' => $ejercicioData['completado'] ?? false,
                        'series_completadas' => $ejercicioData['series_completadas'] ?? 0,
                        'repeticiones_realizadas' => $ejercicioData['repeticiones_realizadas'] ?? null,
                        'peso_utilizado' => $ejercicioData['peso_utilizado'] ?? null,
                        'notas' => $ejercicioData['notas'] ?? null,
                    ]);
                }
            }

            $sincronizadas[] = $sesion->id;
        }

        return response()->json([
            'message' => 'Sesiones sincronizadas correctamente',
            'sincronizadas' => count($sincronizadas),
            'ids' => $sincronizadas
        ]);
    }
}
