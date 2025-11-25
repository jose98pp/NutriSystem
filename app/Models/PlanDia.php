<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanDia extends Model
{
    use HasFactory;

    protected $table = 'plan_dias';
    protected $primaryKey = 'id_dia';

    protected $fillable = [
        'id_plan',
        'dia_index',
        'dia_numero',
        'dia_semana',
        'fecha',
    ];

    protected $casts = [
        'dia_index' => 'integer',
        'dia_numero' => 'integer',
        'fecha' => 'date',
    ];

    // Relaciones
    public function plan()
    {
        return $this->belongsTo(PlanAlimentacion::class, 'id_plan');
    }

    public function comidas()
    {
        return $this->hasMany(Comida::class, 'id_dia')->orderBy('orden');
    }

    // Método helper para calcular totales nutricionales del día
    public function calcularTotales()
    {
        $totales = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
        ];

        foreach ($this->comidas as $comida) {
            $nutrientesComida = $comida->calcularTotales();
            $totales['calorias'] += $nutrientesComida['calorias'];
            $totales['proteinas'] += $nutrientesComida['proteinas'];
            $totales['carbohidratos'] += $nutrientesComida['carbohidratos'];
            $totales['grasas'] += $nutrientesComida['grasas'];
        }

        return $totales;
    }
}
