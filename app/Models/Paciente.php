<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    use HasFactory;

    protected $table = 'pacientes';
    protected $primaryKey = 'id_paciente';

    protected $fillable = [
        'user_id',
        'nombre',
        'apellido',
        'fecha_nacimiento',
        'genero',
        'email',
        'telefono',
        'peso_inicial',
        'estatura',
        'alergias',
        'id_nutricionista',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'peso_inicial' => 'decimal:2',
        'estatura' => 'decimal:2',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function planesAlimentacion()
    {
        return $this->hasMany(PlanAlimentacion::class, 'id_paciente');
    }

    public function ingestas()
    {
        return $this->hasMany(Ingesta::class, 'id_paciente');
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_paciente');
    }

    public function contratos()
    {
        return $this->hasMany(Contrato::class, 'id_paciente');
    }

    public function nutricionista()
    {
        return $this->belongsTo(Nutricionista::class, 'id_nutricionista', 'id_nutricionista');
    }

    public function progressPhotos()
    {
        return $this->hasMany(ProgressPhoto::class, 'id_paciente', 'id_paciente');
    }

    public function direcciones()
    {
        return $this->hasMany(Direccion::class, 'id_paciente', 'id_paciente');
    }

    // Accessors
    public function getEdadAttribute()
    {
        return $this->fecha_nacimiento ? $this->fecha_nacimiento->age : null;
    }
}
