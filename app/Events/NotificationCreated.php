<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct($notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->notification->id_usuario);
    }

    public function broadcastWith()
    {
        return [
            'notification' => [
                'id' => $this->notification->id_notificacion,
                'tipo' => $this->notification->tipo,
                'titulo' => $this->notification->titulo,
                'mensaje' => $this->notification->mensaje,
                'link' => $this->notification->link,
                'leida' => $this->notification->leida,
                'created_at' => $this->notification->created_at->toISOString(),
            ],
        ];
    }

    public function broadcastAs()
    {
        return 'notification.created';
    }
}
