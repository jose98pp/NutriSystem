<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones';
    protected $primaryKey = 'id_evaluacion';

    protected $fillable = [
        'id_paciente',
        'id_nutricionista',
        'tipo',
        'fecha',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    // Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente');
    }

    public function nutricionista()
    {
        return $this->belongsTo(Nutricionista::class, 'id_nutricionista');
    }

    public function mediciones()
    {
        return $this->hasMany(Medicion::class, 'id_evaluacion');
    }

    public function medicion()
    {
        return $this->hasOne(Medicion::class, 'id_evaluacion');
    }

    public function analisisClinicos()
    {
        return $this->belongsToMany(
            AnalisisClinico::class,
            'evaluacion_analisis_clinico',
            'id_evaluacion',
            'id_analisis'
        );
    }

    // Scopes
    public function scopeIniciales($query)
    {
        return $query->where('tipo', 'INICIAL');
    }

    public function scopePeriodicas($query)
    {
        return $query->where('tipo', 'PERIODICA');
    }

    public function scopeFinales($query)
    {
        return $query->where('tipo', 'FINAL');
    }
}
