<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntregaProgramada extends Model
{
    use HasFactory;

    protected $table = 'entrega_programada';
    protected $primaryKey = 'id_entrega';

    protected $fillable = [
        'id_calendario',
        'id_direccion',
        'id_comida',
        'fecha',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Estados posibles
    const ESTADO_PROGRAMADA = 'PROGRAMADA';
    const ESTADO_OMITIDA = 'OMITIDA';
    const ESTADO_ENTREGADA = 'ENTREGADA';
    const ESTADO_PENDIENTE = 'PENDIENTE';

    // Relación con CalendarioEntrega
    public function calendario()
    {
        return $this->belongsTo(CalendarioEntrega::class, 'id_calendario', 'id_calendario');
    }

    // Relación con Direccion
    public function direccion()
    {
        return $this->belongsTo(Direccion::class, 'id_direccion', 'id_direccion');
    }

    // Relación con Comida
    public function comida()
    {
        return $this->belongsTo(Comida::class, 'id_comida', 'id_comida');
    }

    // Scopes para filtrar por estado
    public function scopeProgramadas($query)
    {
        return $query->where('estado', self::ESTADO_PROGRAMADA);
    }

    public function scopeEntregadas($query)
    {
        return $query->where('estado', self::ESTADO_ENTREGADA);
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    // Método para marcar como entregada
    public function marcarComoEntregada()
    {
        $this->estado = self::ESTADO_ENTREGADA;
        $this->save();
    }

    // Método para marcar como omitida
    public function marcarComoOmitida()
    {
        $this->estado = self::ESTADO_OMITIDA;
        $this->save();
    }
}
