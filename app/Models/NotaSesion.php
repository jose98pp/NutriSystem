<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotaSesion extends Model
{
    use HasFactory;

    protected $table = 'notas_sesion';
    protected $primaryKey = 'id_nota';
    
    protected $fillable = [
        'id_sesion',
        'contenido',
        'tipo',
        'privada'
    ];

    protected $casts = [
        'privada' => 'boolean'
    ];

    // Relación con Sesión
    public function sesion()
    {
        return $this->belongsTo(Sesion::class, 'id_sesion', 'id_sesion');
    }

    // Scopes
    public function scopePublicas($query)
    {
        return $query->where('privada', false);
    }

    public function scopePrivadas($query)
    {
        return $query->where('privada', true);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }
}
