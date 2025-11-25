<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $table = 'planes';

    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
        'caracteristicas',
        'popular',
        'activo',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'popular' => 'boolean',
        'activo' => 'boolean',
    ];

    /**
     * Relación con suscripciones
     */
    public function suscripciones()
    {
        return $this->hasMany(Suscripcion::class);
    }
}
