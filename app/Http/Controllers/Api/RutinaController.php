<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rutina;
use App\Models\RutinaPaciente;
use App\Services\RutinaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RutinaController extends Controller
{
    protected $rutinaService;

    public function __construct(RutinaService $rutinaService)
    {
        $this->rutinaService = $rutinaService;
    }

    public function index(Request $request)
    {
        $query = Rutina::with(['ejercicios', 'creador'])->activas();

        if ($request->has('nivel')) {
            $query->porNivel($request->nivel);
        }

        if ($request->has('plan_id')) {
            $query->porPlan($request->plan_id);
        }

        $rutinas = $query->paginate(15);
        return response()->json($rutinas);
    }

    public function show($id)
    {
        $rutina = Rutina::with(['ejercicios.gruposMusculares', 'plan', 'creador'])->findOrFail($id);
        return response()->json($rutina);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:200',
            'nivel_dificultad' => 'required|in:principiante,intermedio,avanzado',
            'duracion_estimada' => 'required|integer|min:1',
            'ejercicios' => 'required|array|min:1',
            'ejercicios.*.ejercicio_id' => 'required|exists:ejercicios,id',
            'ejercicios.*.orden' => 'required|integer',
            'ejercicios.*.series' => 'required|integer|min:1',
            'ejercicios.*.repeticiones' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rutina = $this->rutinaService->crearRutinaPersonalizada(
            $request->except('ejercicios'),
            $request->ejercicios
        );

        return response()->json($rutina, 201);
    }

    public function update(Request $request, $id)
    {
        $rutina = Rutina::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:200',
            'nivel_dificultad' => 'in:principiante,intermedio,avanzado',
            'duracion_estimada' => 'integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rutina->update($request->except('ejercicios'));

        if ($request->has('ejercicios')) {
            $rutina->ejercicios()->detach();
            foreach ($request->ejercicios as $ejercicio) {
                $rutina->ejercicios()->attach($ejercicio['ejercicio_id'], [
                    'orden' => $ejercicio['orden'],
                    'series' => $ejercicio['series'],
                    'repeticiones' => $ejercicio['repeticiones'],
                    'descanso_segundos' => $ejercicio['descanso_segundos'] ?? 60,
                    'notas' => $ejercicio['notas'] ?? null,
                ]);
            }
        }

        return response()->json($rutina->load('ejercicios'));
    }

    public function destroy($id)
    {
        $rutina = Rutina::findOrFail($id);
        $rutina->activo = false;
        $rutina->save();

        return response()->json(['message' => 'Rutina desactivada correctamente']);
    }

    public function predeterminadas()
    {
        $rutinas = Rutina::with('ejercicios')
            ->predeterminadas()
            ->activas()
            ->get();

        return response()->json($rutinas);
    }

    public function misRutinas()
    {
        $user = auth()->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'Usuario no es paciente'], 403);
        }

        $rutinas = RutinaPaciente::with(['rutina.ejercicios', 'planAlimentacion'])
            ->porPaciente($paciente->id_paciente)
            ->activas()
            ->vigentes()
            ->get()
            ->map(function ($rutinaPaciente) {
                return [
                    'id' => $rutinaPaciente->id,
                    'rutina' => $rutinaPaciente->rutina,
                    'fecha_asignacion' => $rutinaPaciente->fecha_asignacion,
                    'fecha_inicio' => $rutinaPaciente->fecha_inicio,
                    'dias_semana' => $rutinaPaciente->dias_semana,
                    'hora_recordatorio' => $rutinaPaciente->hora_recordatorio,
                    'debe_entrenar_hoy' => $rutinaPaciente->debeEntrenarHoy(),
                ];
            });

        return response()->json($rutinas);
    }

    public function asignarPaciente(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'paciente_id' => 'required|exists:pacientes,id_paciente',
            'rutina_id' => 'required|exists:rutinas,id',
            'fecha_inicio' => 'required|date',
            'dias_semana' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rutinaPaciente = RutinaPaciente::create([
            'paciente_id' => $request->paciente_id,
            'rutina_id' => $request->rutina_id,
            'plan_alimentacion_id' => $request->plan_alimentacion_id,
            'asignado_por' => auth()->id(),
            'fecha_asignacion' => now(),
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'dias_semana' => $request->dias_semana,
            'hora_recordatorio' => $request->hora_recordatorio,
            'activa' => true,
        ]);

        return response()->json($rutinaPaciente->load('rutina'), 201);
    }
}
