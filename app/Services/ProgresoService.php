<?php

namespace App\Services;

use App\Models\SesionEntrenamiento;
use Carbon\Carbon;

class ProgresoService
{
    public function calcularEstadisticas($pacienteId, $periodo = 'mes')
    {
        $fechaInicio = match($periodo) {
            'semana' => Carbon::now()->startOfWeek(),
            'mes' => Carbon::now()->startOfMonth(),
            'año' => Carbon::now()->startOfYear(),
            default => Carbon::now()->subDays(30),
        };

        $sesiones = SesionEntrenamiento::porPaciente($pacienteId)
            ->entreFechas($fechaInicio, Carbon::now())
            ->get();

        $sesionesCompletadas = $sesiones->where('completada', true);

        return [
            'total_sesiones' => $sesiones->count(),
            'sesiones_completadas' => $sesionesCompletadas->count(),
            'porcentaje_cumplimiento' => $sesiones->count() > 0 
                ? round(($sesionesCompletadas->count() / $sesiones->count()) * 100) 
                : 0,
            'tiempo_total_minutos' => $sesionesCompletadas->sum('duracion_minutos'),
            'calorias_totales' => $sesionesCompletadas->sum('calorias_quemadas'),
            'promedio_duracion' => $sesionesCompletadas->avg('duracion_minutos'),
            'racha_actual' => $this->calcularRachaActual($pacienteId),
            'frecuencia_semanal' => $this->calcularFrecuenciaSemanal($pacienteId),
        ];
    }

    public function calcularCaloriasQuemadas($sesionId)
    {
        $sesion = SesionEntrenamiento::with('sesionEjercicios.ejercicio')->findOrFail($sesionId);
        
        $calorias = 0;
        foreach ($sesion->sesionEjercicios as $sesionEjercicio) {
            if ($sesionEjercicio->completado && $sesionEjercicio->ejercicio) {
                $caloriasEjercicio = $sesionEjercicio->ejercicio->calorias_estimadas ?? 0;
                $duracion = $sesionEjercicio->ejercicio->duracion_estimada ?? 1;
                $calorias += $caloriasEjercicio * $duracion;
            }
        }

        return $calorias;
    }

    public function calcularPorcentajeCompletado($sesionId)
    {
        $sesion = SesionEntrenamiento::with('sesionEjercicios')->findOrFail($sesionId);
        
        $totalEjercicios = $sesion->sesionEjercicios->count();
        if ($totalEjercicios === 0) {
            return 0;
        }

        $completados = $sesion->sesionEjercicios->where('completado', true)->count();
        return round(($completados / $totalEjercicios) * 100);
    }

    public function generarReporteSemanal($pacienteId)
    {
        $inicioSemana = Carbon::now()->startOfWeek();
        $finSemana = Carbon::now()->endOfWeek();

        $sesiones = SesionEntrenamiento::porPaciente($pacienteId)
            ->entreFechas($inicioSemana, $finSemana)
            ->with('rutinaPaciente.rutina')
            ->get();

        $sesionesCompletadas = $sesiones->where('completada', true);

        return [
            'periodo' => [
                'inicio' => $inicioSemana->format('Y-m-d'),
                'fin' => $finSemana->format('Y-m-d'),
            ],
            'resumen' => [
                'sesiones_programadas' => $sesiones->count(),
                'sesiones_completadas' => $sesionesCompletadas->count(),
                'tiempo_total' => $sesionesCompletadas->sum('duracion_minutos'),
                'calorias_quemadas' => $sesionesCompletadas->sum('calorias_quemadas'),
            ],
            'sesiones_por_dia' => $this->agruparSesionesPorDia($sesiones),
            'rutinas_realizadas' => $sesionesCompletadas->groupBy('rutinaPaciente.rutina.nombre')
                ->map(fn($grupo) => $grupo->count())
                ->toArray(),
        ];
    }

    private function calcularRachaActual($pacienteId)
    {
        $racha = 0;
        $fecha = Carbon::now();

        while (true) {
            $sesion = SesionEntrenamiento::porPaciente($pacienteId)
                ->porFecha($fecha)
                ->completadas()
                ->first();

            if ($sesion) {
                $racha++;
                $fecha->subDay();
            } else {
                break;
            }

            // Límite de seguridad
            if ($racha > 365) break;
        }

        return $racha;
    }

    private function calcularFrecuenciaSemanal($pacienteId)
    {
        $ultimasSemanas = 4;
        $total = 0;

        for ($i = 0; $i < $ultimasSemanas; $i++) {
            $inicioSemana = Carbon::now()->subWeeks($i)->startOfWeek();
            $finSemana = Carbon::now()->subWeeks($i)->endOfWeek();

            $sesiones = SesionEntrenamiento::porPaciente($pacienteId)
                ->entreFechas($inicioSemana, $finSemana)
                ->completadas()
                ->count();

            $total += $sesiones;
        }

        return round($total / $ultimasSemanas, 1);
    }

    private function agruparSesionesPorDia($sesiones)
    {
        return $sesiones->groupBy(function ($sesion) {
            return $sesion->fecha->format('Y-m-d');
        })->map(function ($grupo) {
            return [
                'total' => $grupo->count(),
                'completadas' => $grupo->where('completada', true)->count(),
                'tiempo_total' => $grupo->where('completada', true)->sum('duracion_minutos'),
            ];
        })->toArray();
    }
}
