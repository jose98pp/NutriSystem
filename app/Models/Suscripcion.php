<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suscripcion extends Model
{
    use HasFactory;

    protected $table = 'suscripciones';

    protected $fillable = [
        'user_id',
        'servicio_id',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'proximo_cobro',
        'metodo_pago',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'proximo_cobro' => 'datetime',
    ];

    /**
     * Relación con usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con servicio
     */
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id', 'id_servicio');
    }
}
