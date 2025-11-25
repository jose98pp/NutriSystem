<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SesionEntrenamiento extends Model
{
    use HasFactory;

    protected $table = 'sesiones_entrenamiento';

    protected $fillable = [
        'rutina_paciente_id',
        'paciente_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'duracion_minutos',
        'completada',
        'porcentaje_completado',
        'calorias_quemadas',
        'notas',
        'sincronizado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
        'completada' => 'boolean',
        'sincronizado' => 'boolean',
    ];

    // Relaciones
    public function rutinaPaciente()
    {
        return $this->belongsTo(RutinaPaciente::class);
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'paciente_id', 'id_paciente');
    }

    public function sesionEjercicios()
    {
        return $this->hasMany(SesionEjercicio::class);
    }

    // Scopes
    public function scopeCompletadas($query)
    {
        return $query->where('completada', true);
    }

    public function scopePorPaciente($query, $pacienteId)
    {
        return $query->where('paciente_id', $pacienteId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
    }

    public function scopePendientesSincronizar($query)
    {
        return $query->where('sincronizado', false);
    }

    // Helpers
    public function calcularDuracion()
    {
        if ($this->hora_inicio && $this->hora_fin) {
            $this->duracion_minutos = $this->hora_inicio->diffInMinutes($this->hora_fin);
            $this->save();
        }
    }

    public function calcularPorcentajeCompletado()
    {
        $totalEjercicios = $this->sesionEjercicios()->count();
        if ($totalEjercicios === 0) {
            return 0;
        }

        $completados = $this->sesionEjercicios()->where('completado', true)->count();
        $porcentaje = ($completados / $totalEjercicios) * 100;
        
        $this->porcentaje_completado = round($porcentaje);
        $this->save();

        return $this->porcentaje_completado;
    }

    public function calcularCaloriasQuemadas()
    {
        $calorias = 0;
        
        foreach ($this->sesionEjercicios as $sesionEjercicio) {
            if ($sesionEjercicio->completado && $sesionEjercicio->ejercicio) {
                $caloriasEjercicio = $sesionEjercicio->ejercicio->calorias_estimadas ?? 0;
                $duracion = $sesionEjercicio->ejercicio->duracion_estimada ?? 1;
                $calorias += $caloriasEjercicio * $duracion;
            }
        }

        $this->calorias_quemadas = $calorias;
        $this->save();

        return $calorias;
    }

    public function marcarComoCompletada()
    {
        $this->completada = true;
        $this->hora_fin = Carbon::now();
        $this->calcularDuracion();
        $this->calcularPorcentajeCompletado();
        $this->calcularCaloriasQuemadas();
        $this->save();
    }
}
