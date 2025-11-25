<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingesta extends Model
{
    use HasFactory;

    protected $table = 'ingestas';
    protected $primaryKey = 'id_ingesta';

    protected $fillable = [
        'fecha_hora',
        'id_paciente',
        'tipo_comida',
        'observaciones',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    // Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente');
    }

    public function alimentos()
    {
        return $this->belongsToMany(Alimento::class, 'alimento_ingesta', 'id_ingesta', 'id_alimento')
                    ->withPivot('cantidad_gramos', 'id_alimento_ingesta')
                    ->withTimestamps();
    }

    // Método helper para calcular totales nutricionales de la ingesta
    public function calcularTotales()
    {
        $totales = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
        ];

        foreach ($this->alimentos as $alimento) {
            $cantidad = $alimento->pivot->cantidad_gramos;
            $nutrientes = $alimento->calcularNutrientes($cantidad);
            
            $totales['calorias'] += $nutrientes['calorias'];
            $totales['proteinas'] += $nutrientes['proteinas'];
            $totales['carbohidratos'] += $nutrientes['carbohidratos'];
            $totales['grasas'] += $nutrientes['grasas'];
        }

        return $totales;
    }

    // Scope para filtrar por fecha
    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_hora', [$fechaInicio, $fechaFin]);
    }
}
