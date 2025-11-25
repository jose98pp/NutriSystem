<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receta extends Model
{
    use HasFactory;

    protected $table = 'recetas';
    protected $primaryKey = 'id_receta';

    protected $fillable = [
        'nombre',
        'kcal',
        'restricciones',
    ];

    protected $casts = [
        'kcal' => 'integer',
    ];

    // Relación muchos a muchos con Comida
    public function comidas()
    {
        return $this->belongsToMany(
            Comida::class,
            'comida_receta',
            'id_receta',
            'id_comida'
        )->withPivot('porciones')->withTimestamps();
    }
}
