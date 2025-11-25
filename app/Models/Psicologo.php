<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Psicologo extends Model
{
    use HasFactory;

    protected $table = 'psicologos';
    protected $primaryKey = 'id_psicologo';
    
    protected $fillable = [
        'user_id',
        'nombre',
        'apellido',
        'cedula_profesional',
        'especialidad',
        'telefono',
        'foto_perfil',
        'estado'
    ];

    // Relación con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación muchos a muchos con Pacientes
    public function pacientes()
    {
        return $this->belongsToMany(Paciente::class, 'paciente_psicologo', 'id_psicologo', 'id_paciente')
                    ->withPivot('fecha_asignacion', 'estado', 'notas')
                    ->withTimestamps();
    }

    // Relación con Sesiones
    public function sesiones()
    {
        return $this->hasMany(Sesion::class, 'profesional_id')
                    ->where('tipo_profesional', 'PSICOLOGO');
    }

    // Scope para psicólogos activos
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellido}";
    }
}
