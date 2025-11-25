<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicion extends Model
{
    use HasFactory;

    protected $table = 'mediciones';
    protected $primaryKey = 'id_medicion';

    protected $fillable = [
        'id_evaluacion',
        'peso_kg',
        'altura_m',
        'porc_grasa',
        'masa_magra_kg',
    ];

    protected $casts = [
        'peso_kg' => 'decimal:2',
        'altura_m' => 'decimal:2',
        'porc_grasa' => 'decimal:2',
        'masa_magra_kg' => 'decimal:2',
    ];

    // Relaciones
    public function evaluacion()
    {
        return $this->belongsTo(Evaluacion::class, 'id_evaluacion');
    }

    // Accessor para calcular IMC
    public function getImcAttribute()
    {
        if ($this->peso_kg && $this->altura_m) {
            return round($this->peso_kg / ($this->altura_m ** 2), 2);
        }
        return null;
    }

    // Accessor para clasificación de IMC
    public function getClasificacionImcAttribute()
    {
        $imc = $this->imc;
        
        if (!$imc) return 'N/A';
        
        if ($imc < 18.5) return 'Bajo peso';
        if ($imc < 25) return 'Normal';
        if ($imc < 30) return 'Sobrepeso';
        return 'Obesidad';
    }
}
