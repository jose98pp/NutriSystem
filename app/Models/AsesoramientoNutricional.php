<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AsesoramientoNutricional extends Model
{
    use HasFactory;

    protected $table = 'asesoramiento_nutricional';
    protected $primaryKey = 'id_servicio';
    public $incrementing = false;

    protected $fillable = [
        'id_servicio',
        'control_al_dia_15',
    ];

    protected $casts = [
        'control_al_dia_15' => 'boolean',
    ];

    // Relación con Servicio
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }
}
