<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RutinaEjercicio extends Pivot
{
    protected $table = 'rutina_ejercicio';

    protected $fillable = [
        'rutina_id',
        'ejercicio_id',
        'orden',
        'series',
        'repeticiones',
        'descanso_segundos',
        'notas',
    ];

    // Relaciones
    public function rutina()
    {
        return $this->belongsTo(Rutina::class);
    }

    public function ejercicio()
    {
        return $this->belongsTo(Ejercicio::class);
    }
}
