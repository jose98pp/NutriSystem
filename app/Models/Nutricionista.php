<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nutricionista extends Model
{
    use HasFactory;

    protected $table = 'nutricionistas';
    protected $primaryKey = 'id_nutricionista';

    protected $fillable = [
        'user_id',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'especialidad',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pacientes()
    {
        return $this->hasMany(Paciente::class, 'id_nutricionista');
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_nutricionista');
    }

    // Accessor para nombre completo
    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellido}";
    }
}
