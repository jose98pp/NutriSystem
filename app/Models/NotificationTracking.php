<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class NotificationTracking extends Model
{
    use HasFactory;

    protected $table = 'notification_tracking';

    protected $fillable = [
        'tipo_evento',
        'entidad_id',
        'entidad_tipo',
        'id_usuario',
        'enviada_at',
    ];

    protected $casts = [
        'enviada_at' => 'datetime',
    ];

    /**
     * Relación con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    /**
     * Verificar si ya existe un tracking para evitar duplicados
     * 
     * @param string $tipoEvento
     * @param int $entidadId
     * @param string $entidadTipo
     * @param int $userId
     * @return bool
     */
    public static function yaEnviada(string $tipoEvento, int $entidadId, string $entidadTipo, int $userId): bool
    {
        return self::where('tipo_evento', $tipoEvento)
            ->where('entidad_id', $entidadId)
            ->where('entidad_tipo', $entidadTipo)
            ->where('id_usuario', $userId)
            ->exists();
    }

    /**
     * Registrar que se envió una notificación
     * 
     * @param string $tipoEvento
     * @param int $entidadId
     * @param string $entidadTipo
     * @param int $userId
     * @return NotificationTracking|null
     */
    public static function registrar(string $tipoEvento, int $entidadId, string $entidadTipo, int $userId): ?NotificationTracking
    {
        try {
            return self::create([
                'tipo_evento' => $tipoEvento,
                'entidad_id' => $entidadId,
                'entidad_tipo' => $entidadTipo,
                'id_usuario' => $userId,
                'enviada_at' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            // Si falla por duplicado, retornar null
            return null;
        }
    }

    /**
     * Limpiar tracking antiguo (más de X días)
     * 
     * @param int $dias
     * @return int Cantidad de registros eliminados
     */
    public static function limpiarAntiguos(int $dias = 90): int
    {
        return self::where('enviada_at', '<', Carbon::now()->subDays($dias))->delete();
    }
}
