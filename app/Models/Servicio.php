<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';
    protected $primaryKey = 'id_servicio';

    protected $fillable = [
        'nombre',
        'tipo_servicio',
        'duracion_dias',
        'costo',
        'descripcion',
    ];

    protected $casts = [
        'costo' => 'decimal:4',
        'duracion_dias' => 'integer',
    ];

    // Relaciones
    public function contratos()
    {
        return $this->hasMany(Contrato::class, 'id_servicio');
    }

    public function asesoramientoNutricional()
    {
        return $this->hasOne(AsesoramientoNutricional::class, 'id_servicio', 'id_servicio');
    }

    public function catering()
    {
        return $this->hasOne(Catering::class, 'id_servicio', 'id_servicio');
    }

    // Método helper para obtener el tipo específico de servicio
    public function getServicioEspecifico()
    {
        if ($this->tipo_servicio === 'ASESORAMIENTO') {
            return $this->asesoramientoNutricional;
        } elseif ($this->tipo_servicio === 'CATERING') {
            return $this->catering;
        }
        return null;
    }
}
