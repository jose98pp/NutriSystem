<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Direccion extends Model
{
    use HasFactory;

    protected $table = 'direcciones';
    protected $primaryKey = 'id_direccion';

    protected $fillable = [
        'id_paciente',
        'alias',
        'descripcion',
        'direccion_completa',
        'ciudad',
        'codigo_postal',
        'referencia',
        'es_principal',
        'geo_lat',
        'geo_lng',
    ];

    protected $casts = [
        'geo_lat' => 'decimal:6',
        'geo_lng' => 'decimal:6',
        'es_principal' => 'boolean',
    ];

    // Relación con Paciente
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    // Relación con EntregaProgramada
    public function entregas()
    {
        return $this->hasMany(EntregaProgramada::class, 'id_direccion', 'id_direccion');
    }
}
