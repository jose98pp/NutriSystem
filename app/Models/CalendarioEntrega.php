<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CalendarioEntrega extends Model
{
    use HasFactory;

    protected $table = 'calendario_entrega';
    protected $primaryKey = 'id_calendario';

    protected $fillable = [
        'id_contrato',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    // Relación con Contrato
    public function contrato()
    {
        return $this->belongsTo(Contrato::class, 'id_contrato', 'id_contrato');
    }

    // Relación con EntregaProgramada
    public function entregas()
    {
        return $this->hasMany(EntregaProgramada::class, 'id_calendario', 'id_calendario');
    }

    // Método para calcular la duración en días
    public function getDuracionDiasAttribute()
    {
        return $this->fecha_inicio->diffInDays($this->fecha_fin) + 1;
    }

    // Método para verificar si está activo
    public function getActivoAttribute()
    {
        $hoy = Carbon::today();
        return $hoy->between($this->fecha_inicio, $this->fecha_fin);
    }
}
