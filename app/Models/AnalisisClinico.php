<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalisisClinico extends Model
{
    use HasFactory;

    protected $table = 'analisis_clinicos';
    protected $primaryKey = 'id_analisis';

    protected $fillable = [
        'tipo',
        'resultado',
    ];

    // Relación muchos a muchos con Evaluacion
    public function evaluaciones()
    {
        return $this->belongsToMany(
            Evaluacion::class,
            'evaluacion_analisis_clinico',
            'id_analisis',
            'id_evaluacion'
        );
    }
}
