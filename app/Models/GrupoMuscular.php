<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrupoMuscular extends Model
{
    use HasFactory;

    protected $table = 'grupos_musculares';

    protected $fillable = [
        'nombre',
        'nombre_cientifico',
        'descripcion',
        'zona_corporal',
        'svg_path',
        'color_hex',
        'orden',
    ];

    // Relaciones
    public function ejercicios()
    {
        return $this->belongsToMany(Ejercicio::class, 'ejercicio_grupo_muscular')
            ->withPivot('es_principal')
            ->withTimestamps();
    }

    // Scopes
    public function scopePorZona($query, $zona)
    {
        return $query->where('zona_corporal', $zona);
    }

    public function scopeOrdenados($query)
    {
        return $query->orderBy('orden');
    }
}
