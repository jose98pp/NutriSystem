<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressPhoto extends Model
{
    use HasFactory;

    protected $table = 'progress_photos';
    protected $primaryKey = 'id_foto';

    protected $fillable = [
        'id_paciente',
        'titulo',
        'descripcion',
        'foto_url',
        'tipo',
        'peso_kg',
        'fecha'
    ];

    protected $casts = [
        'fecha' => 'date',
        'peso_kg' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relación con Paciente
     */
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    /**
     * Scope para fotos de un paciente específico
     */
    public function scopeDePaciente($query, $pacienteId)
    {
        return $query->where('id_paciente', $pacienteId);
    }

    /**
     * Scope para filtrar por tipo
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para ordenar por fecha
     */
    public function scopeOrdenadas($query)
    {
        return $query->orderBy('fecha', 'desc');
    }

    /**
     * Obtener URL completa de la foto
     */
    public function getFotoUrlCompletaAttribute()
    {
        return asset('storage/' . $this->foto_url);
    }
}
