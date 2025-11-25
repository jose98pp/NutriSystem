<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PlanAlimentacion extends Model
{
    use HasFactory;

    protected $table = 'planes_alimentacion';
    protected $primaryKey = 'id_plan';

    protected $fillable = [
        'id_contrato',
        'id_paciente',
        'id_nutricionista',
        'nombre',
        'nombre_plan',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'objetivo',
        'calorias_objetivo',
        'estado',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activo' => 'boolean',
    ];

    // Relaciones
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente');
    }

    public function nutricionista()
    {
        return $this->belongsTo(Nutricionista::class, 'id_nutricionista');
    }

    public function contrato()
    {
        return $this->belongsTo(Contrato::class, 'id_contrato');
    }

    public function dias()
    {
        return $this->hasMany(PlanDia::class, 'id_plan');
    }

    public function planDias()
    {
        return $this->hasMany(PlanDia::class, 'id_plan');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->whereDate('fecha_inicio', '<=', Carbon::now())
                     ->whereDate('fecha_fin', '>=', Carbon::now());
    }

    // Helper para verificar si el plan está activo
    public function getEsActivoAttribute()
    {
        $hoy = Carbon::now();
        return $this->fecha_inicio <= $hoy && $this->fecha_fin >= $hoy;
    }
}
