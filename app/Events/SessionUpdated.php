<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sesion;
    public $pacienteId;
    public $tipo;

    public function __construct($sesion, $pacienteId, $tipo = 'modificada')
    {
        $this->sesion = $sesion;
        $this->pacienteId = $pacienteId;
        $this->tipo = $tipo; // 'creada', 'modificada', 'cancelada', 'completada'
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->pacienteId);
    }

    public function broadcastWith()
    {
        return [
            'sesion' => [
                'id' => $this->sesion->id_sesion ?? $this->sesion['id_sesion'] ?? null,
                'fecha' => $this->sesion->fecha ?? $this->sesion['fecha'] ?? null,
                'hora_inicio' => $this->sesion->hora_inicio ?? $this->sesion['hora_inicio'] ?? null,
                'hora_fin' => $this->sesion->hora_fin ?? $this->sesion['hora_fin'] ?? null,
                'estado' => $this->sesion->estado ?? $this->sesion['estado'] ?? null,
                'tipo' => $this->tipo,
            ],
            'paciente_id' => $this->pacienteId,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs()
    {
        return 'session.updated';
    }
}
