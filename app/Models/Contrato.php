<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contrato extends Model
{
    use HasFactory;

    protected $table = 'contratos';
    protected $primaryKey = 'id_contrato';

    protected $fillable = [
        'id_paciente',
        'id_servicio',
        'fecha_inicio',
        'fecha_fin',
        'costo_contratado',
        'estado',
        'observaciones',
        'fecha_cancelacion',
        'cancelado_por',
        'motivo_cancelacion',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'costo_contratado' => 'decimal:4',
        'fecha_cancelacion' => 'datetime',
    ];

    // Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }

    public function planesAlimentacion()
    {
        return $this->hasMany(PlanAlimentacion::class, 'id_contrato');
    }

    public function calendarioEntrega()
    {
        return $this->hasOne(CalendarioEntrega::class, 'id_contrato', 'id_contrato');
    }

    public function canceladoPor()
    {
        return $this->belongsTo(User::class, 'cancelado_por', 'id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }
}
