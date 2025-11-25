<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $mensaje;
    public $usuario;

    public function __construct($mensaje, $usuario)
    {
        $this->mensaje = $mensaje;
        $this->usuario = $usuario;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('chat.' . $this->mensaje->conversacion_id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->mensaje->id,
            'contenido' => $this->mensaje->contenido,
            'usuario' => [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
                'foto_perfil' => $this->usuario->foto_perfil,
            ],
            'created_at' => $this->mensaje->created_at->toISOString(),
        ];
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}
