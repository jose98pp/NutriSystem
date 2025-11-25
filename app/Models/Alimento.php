<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alimento extends Model
{
    use HasFactory;

    protected $table = 'alimentos';
    protected $primaryKey = 'id_alimento';

    protected $fillable = [
        'nombre',
        'categoria',
        'calorias_por_100g',
        'proteinas_por_100g',
        'carbohidratos_por_100g',
        'grasas_por_100g',
        'restricciones',
    ];

    protected $casts = [
        'calorias_por_100g' => 'decimal:2',
        'proteinas_por_100g' => 'decimal:2',
        'carbohidratos_por_100g' => 'decimal:2',
        'grasas_por_100g' => 'decimal:2',
    ];

    // Relaciones con comidas (muchos a muchos a través de alimento_comida)
    public function comidas()
    {
        return $this->belongsToMany(Comida::class, 'alimento_comida', 'id_alimento', 'id_comida')
                    ->withPivot('cantidad_gramos')
                    ->withTimestamps();
    }

    // Relaciones con ingestas (muchos a muchos a través de alimento_ingesta)
    public function ingestas()
    {
        return $this->belongsToMany(Ingesta::class, 'alimento_ingesta', 'id_alimento', 'id_ingesta')
                    ->withPivot('cantidad_gramos')
                    ->withTimestamps();
    }

    // Método helper para calcular nutrientes según cantidad
    public function calcularNutrientes($cantidad_gramos)
    {
        $factor = $cantidad_gramos / 100;
        
        return [
            'calorias' => round($this->calorias_por_100g * $factor, 2),
            'proteinas' => round($this->proteinas_por_100g * $factor, 2),
            'carbohidratos' => round($this->carbohidratos_por_100g * $factor, 2),
            'grasas' => round($this->grasas_por_100g * $factor, 2),
        ];
    }
}
