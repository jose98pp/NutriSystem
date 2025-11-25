<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ejercicio extends Model
{
    use HasFactory;

    protected $table = 'ejercicios';

    protected $fillable = [
        'nombre',
        'descripcion',
        'instrucciones',
        'nivel_dificultad',
        'tipo_ejercicio',
        'equipo_necesario',
        'calorias_estimadas',
        'duracion_estimada',
        'video_url',
        'imagen_principal',
        'imagenes_pasos',
        'advertencias',
        'variaciones',
        'activo',
        'created_by',
    ];

    protected $casts = [
        'imagenes_pasos' => 'array',
        'variaciones' => 'array',
        'activo' => 'boolean',
    ];

    // Relaciones
    public function gruposMusculares()
    {
        return $this->belongsToMany(GrupoMuscular::class, 'ejercicio_grupo_muscular')
            ->withPivot('es_principal')
            ->withTimestamps();
    }

    public function rutinas()
    {
        return $this->belongsToMany(Rutina::class, 'rutina_ejercicio')
            ->withPivot('orden', 'series', 'repeticiones', 'descanso_segundos', 'notas')
            ->withTimestamps();
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sesionEjercicios()
    {
        return $this->hasMany(SesionEjercicio::class);
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorNivel($query, $nivel)
    {
        return $query->where('nivel_dificultad', $nivel);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_ejercicio', $tipo);
    }

    public function scopePorGrupoMuscular($query, $grupoId)
    {
        return $query->whereHas('gruposMusculares', function ($q) use ($grupoId) {
            $q->where('grupos_musculares.id', $grupoId);
        });
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombre', 'like', "%{$termino}%")
              ->orWhere('descripcion', 'like', "%{$termino}%");
        });
    }
}
