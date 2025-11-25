<?php

namespace App\Services;

use App\Models\Rutina;
use App\Models\RutinaPaciente;
use App\Models\PlanAlimentacion;
use Carbon\Carbon;

class RutinaService
{
    public function asignarRutinaPredeterminada($pacienteId, $planId)
    {
        $plan = PlanAlimentacion::find($planId);
        if (!$plan) {
            throw new \Exception('Plan de alimentación no encontrado');
        }

        // Buscar rutina predeterminada para este tipo de plan
        $rutina = Rutina::where('tipo_plan_id', $plan->tipo_plan_id)
            ->where('es_predeterminada', true)
            ->where('activo', true)
            ->first();

        if (!$rutina) {
            // Si no hay rutina específica, usar una genérica
            $rutina = Rutina::where('es_predeterminada', true)
                ->where('activo', true)
                ->whereNull('tipo_plan_id')
                ->first();
        }

        if (!$rutina) {
            throw new \Exception('No hay rutinas predeterminadas disponibles');
        }

        // Crear asignación
        return RutinaPaciente::create([
            'paciente_id' => $pacienteId,
            'rutina_id' => $rutina->id,
            'plan_alimentacion_id' => $planId,
            'asignado_por' => auth()->id(),
            'fecha_asignacion' => Carbon::now(),
            'fecha_inicio' => Carbon::now(),
            'dias_semana' => [1, 3, 5], // Lun, Mie, Vie por defecto
            'activa' => true,
        ]);
    }

    public function crearRutinaPersonalizada($data, $ejercicios)
    {
        $rutina = Rutina::create([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'nivel_dificultad' => $data['nivel_dificultad'],
            'duracion_estimada' => $data['duracion_estimada'],
            'frecuencia_semanal' => $data['frecuencia_semanal'] ?? 3,
            'objetivo' => $data['objetivo'] ?? null,
            'tipo_plan_id' => $data['tipo_plan_id'] ?? null,
            'es_predeterminada' => false,
            'created_by' => auth()->id(),
            'activo' => true,
        ]);

        // Agregar ejercicios
        foreach ($ejercicios as $ejercicio) {
            $rutina->ejercicios()->attach($ejercicio['ejercicio_id'], [
                'orden' => $ejercicio['orden'],
                'series' => $ejercicio['series'],
                'repeticiones' => $ejercicio['repeticiones'],
                'descanso_segundos' => $ejercicio['descanso_segundos'] ?? 60,
                'notas' => $ejercicio['notas'] ?? null,
            ]);
        }

        return $rutina->load('ejercicios');
    }

    public function clonarRutina($rutinaId, $modificaciones = [])
    {
        $rutinaOriginal = Rutina::with('ejercicios')->findOrFail($rutinaId);

        $rutinaNueva = Rutina::create([
            'nombre' => $modificaciones['nombre'] ?? $rutinaOriginal->nombre . ' (Copia)',
            'descripcion' => $modificaciones['descripcion'] ?? $rutinaOriginal->descripcion,
            'nivel_dificultad' => $modificaciones['nivel_dificultad'] ?? $rutinaOriginal->nivel_dificultad,
            'duracion_estimada' => $modificaciones['duracion_estimada'] ?? $rutinaOriginal->duracion_estimada,
            'frecuencia_semanal' => $modificaciones['frecuencia_semanal'] ?? $rutinaOriginal->frecuencia_semanal,
            'objetivo' => $modificaciones['objetivo'] ?? $rutinaOriginal->objetivo,
            'tipo_plan_id' => $modificaciones['tipo_plan_id'] ?? $rutinaOriginal->tipo_plan_id,
            'es_predeterminada' => false,
            'created_by' => auth()->id(),
            'activo' => true,
        ]);

        // Copiar ejercicios
        foreach ($rutinaOriginal->ejercicios as $ejercicio) {
            $rutinaNueva->ejercicios()->attach($ejercicio->id, [
                'orden' => $ejercicio->pivot->orden,
                'series' => $ejercicio->pivot->series,
                'repeticiones' => $ejercicio->pivot->repeticiones,
                'descanso_segundos' => $ejercicio->pivot->descanso_segundos,
                'notas' => $ejercicio->pivot->notas,
            ]);
        }

        return $rutinaNueva->load('ejercicios');
    }

    public function validarRutinaParaPlan($rutinaId, $planId)
    {
        $rutina = Rutina::findOrFail($rutinaId);
        $plan = PlanAlimentacion::findOrFail($planId);

        // Si la rutina no tiene plan específico, es válida para todos
        if (!$rutina->tipo_plan_id) {
            return true;
        }

        // Verificar si coincide el tipo de plan
        return $rutina->tipo_plan_id === $plan->tipo_plan_id;
    }
}
