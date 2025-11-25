<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catering extends Model
{
    use HasFactory;

    protected $table = 'catering';
    protected $primaryKey = 'id_servicio';
    public $incrementing = false;

    protected $fillable = [
        'id_servicio',
        'duracion_permitida',
        'evaluacion_cada_dias',
        'incluye_calendario_entrega',
    ];

    protected $casts = [
        'evaluacion_cada_dias' => 'integer',
        'incluye_calendario_entrega' => 'boolean',
    ];

    // Duraciones permitidas
    const DURACION_15_DIAS = '15_DIAS';
    const DURACION_30_DIAS = '30_DIAS';

    // Relación con Servicio
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }

    // Método para obtener la duración en días
    public function getDuracionDias()
    {
        return $this->duracion_permitida === self::DURACION_15_DIAS ? 15 : 30;
    }
}
