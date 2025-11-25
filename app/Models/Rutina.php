<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rutina extends Model
{
    use HasFactory;

    protected $table = 'rutinas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'nivel_dificultad',
        'duracion_estimada',
        'frecuencia_semanal',
        'objetivo',
        'tipo_plan_id',
        'es_predeterminada',
        'created_by',
        'activo',
    ];

    protected $casts = [
        'es_predeterminada' => 'boolean',
        'activo' => 'boolean',
    ];

    // Relaciones
    public function ejercicios()
    {
        return $this->belongsToMany(Ejercicio::class, 'rutina_ejercicio')
            ->withPivot('orden', 'series', 'repeticiones', 'descanso_segundos', 'notas')
            ->withTimestamps()
            ->orderBy('rutina_ejercicio.orden');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'tipo_plan_id');
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function rutinasPacientes()
    {
        return $this->hasMany(RutinaPaciente::class);
    }

    public function sesionesEntrenamiento()
    {
        return $this->hasManyThrough(SesionEntrenamiento::class, RutinaPaciente::class);
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    public function scopePredeterminadas($query)
    {
        return $query->where('es_predeterminada', true);
    }

    public function scopePorNivel($query, $nivel)
    {
        return $query->where('nivel_dificultad', $nivel);
    }

    public function scopePorPlan($query, $planId)
    {
        return $query->where('tipo_plan_id', $planId);
    }
}
