<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RutinaPaciente extends Model
{
    use HasFactory;

    protected $table = 'rutinas_pacientes';

    protected $fillable = [
        'paciente_id',
        'rutina_id',
        'plan_alimentacion_id',
        'asignado_por',
        'fecha_asignacion',
        'fecha_inicio',
        'fecha_fin',
        'dias_semana',
        'hora_recordatorio',
        'activa',
    ];

    protected $casts = [
        'fecha_asignacion' => 'date',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'dias_semana' => 'array',
        'activa' => 'boolean',
    ];

    // Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'paciente_id', 'id_paciente');
    }

    public function rutina()
    {
        return $this->belongsTo(Rutina::class);
    }

    public function planAlimentacion()
    {
        return $this->belongsTo(PlanAlimentacion::class, 'plan_alimentacion_id', 'id_plan');
    }

    public function asignadoPor()
    {
        return $this->belongsTo(User::class, 'asignado_por');
    }

    public function sesionesEntrenamiento()
    {
        return $this->hasMany(SesionEntrenamiento::class);
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    public function scopeVigentes($query)
    {
        $hoy = Carbon::now();
        return $query->where('fecha_inicio', '<=', $hoy)
            ->where(function ($q) use ($hoy) {
                $q->whereNull('fecha_fin')
                  ->orWhere('fecha_fin', '>=', $hoy);
            });
    }

    public function scopePorPaciente($query, $pacienteId)
    {
        return $query->where('paciente_id', $pacienteId);
    }

    // Helpers
    public function esVigente()
    {
        $hoy = Carbon::now();
        return $this->fecha_inicio <= $hoy && 
               ($this->fecha_fin === null || $this->fecha_fin >= $hoy);
    }

    public function debeEntrenarHoy()
    {
        $diaHoy = Carbon::now()->dayOfWeek; // 0=Domingo, 6=Sábado
        return in_array($diaHoy, $this->dias_semana ?? []);
    }
}
