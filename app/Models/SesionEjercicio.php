<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesionEjercicio extends Model
{
    use HasFactory;

    protected $table = 'sesion_ejercicios';

    protected $fillable = [
        'sesion_entrenamiento_id',
        'ejercicio_id',
        'completado',
        'series_completadas',
        'repeticiones_realizadas',
        'peso_utilizado',
        'notas',
    ];

    protected $casts = [
        'completado' => 'boolean',
        'peso_utilizado' => 'decimal:2',
    ];

    // Relaciones
    public function sesionEntrenamiento()
    {
        return $this->belongsTo(SesionEntrenamiento::class);
    }

    public function ejercicio()
    {
        return $this->belongsTo(Ejercicio::class);
    }

    // Scopes
    public function scopeCompletados($query)
    {
        return $query->where('completado', true);
    }

    // Helpers
    public function marcarComoCompletado()
    {
        $this->completado = true;
        $this->save();
        
        // Actualizar porcentaje de la sesión
        $this->sesionEntrenamiento->calcularPorcentajeCompletado();
    }
}
