<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';
    protected $primaryKey = 'id_mensaje';

    protected $fillable = [
        'id_remitente',
        'id_destinatario',
        'mensaje',
        'leido',
        'fecha_lectura'
    ];

    protected $casts = [
        'leido' => 'boolean',
        'fecha_lectura' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relación con Usuario Remitente
     */
    public function remitente()
    {
        return $this->belongsTo(User::class, 'id_remitente');
    }

    /**
     * Relación con Usuario Destinatario
     */
    public function destinatario()
    {
        return $this->belongsTo(User::class, 'id_destinatario');
    }

    /**
     * Scope para mensajes no leídos
     */
    public function scopeNoLeidos($query)
    {
        return $query->where('leido', false);
    }

    /**
     * Marcar como leído
     */
    public function marcarComoLeido()
    {
        $this->update([
            'leido' => true,
            'fecha_lectura' => now()
        ]);
    }

    /**
     * Obtener conversación entre dos usuarios
     */
    public static function conversacion($usuario1, $usuario2)
    {
        return self::where(function($query) use ($usuario1, $usuario2) {
            $query->where('id_remitente', $usuario1)
                  ->where('id_destinatario', $usuario2);
        })->orWhere(function($query) use ($usuario1, $usuario2) {
            $query->where('id_remitente', $usuario2)
                  ->where('id_destinatario', $usuario1);
        })->orderBy('created_at', 'asc')->get();
    }
}
