<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sesion extends Model
{
    use HasFactory;

    protected $table = 'sesiones';
    protected $primaryKey = 'id_sesion';
    
    protected $fillable = [
        'id_paciente',
        'profesional_id',
        'tipo_profesional',
        'tipo_sesion',
        'fecha_hora',
        'duracion_minutos',
        'estado',
        'motivo',
        'notas',
        'link_videollamada',
        'zoom_meeting_id',
        'zoom_meeting_password',
        'zoom_join_url',
        'zoom_start_url',
        'participante_unido_at',
        'finalizada_at',
        'finalizada_por_user_id'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
        'participante_unido_at' => 'datetime',
        'finalizada_at' => 'datetime'
    ];

    // Relación con Paciente
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    // Relación polimórfica con Profesional (Nutricionista o Psicólogo)
    public function profesional()
    {
        if ($this->tipo_profesional === 'NUTRICIONISTA') {
            return $this->belongsTo(Nutricionista::class, 'profesional_id', 'id_nutricionista');
        }
        return $this->belongsTo(Psicologo::class, 'profesional_id', 'id_psicologo');
    }

    // Relación con Notas de Sesión
    public function notas()
    {
        return $this->hasMany(NotaSesion::class, 'id_sesion', 'id_sesion');
    }

    // Scopes
    public function scopeProgramadas($query)
    {
        return $query->where('estado', 'PROGRAMADA');
    }

    public function scopeCompletadas($query)
    {
        return $query->where('estado', 'COMPLETADA');
    }

    public function scopeProximas($query)
    {
        return $query->where('estado', 'PROGRAMADA')
                    ->where('fecha_hora', '>=', now())
                    ->orderBy('fecha_hora', 'asc');
    }

    public function scopeVideollamadas($query)
    {
        return $query->where('tipo_sesion', 'VIDEOLLAMADA');
    }

    // Método para generar link de videollamada
    public function generarLinkVideollamada()
    {
        if ($this->tipo_sesion === 'VIDEOLLAMADA' && !$this->link_videollamada) {
            // Generar un nombre único para la sala
            $roomName = 'nutrisystem-' . $this->id_sesion . '-' . time();
            $this->link_videollamada = "https://meet.jit.si/{$roomName}";
            $this->save();
        }
        return $this->link_videollamada;
    }
}
