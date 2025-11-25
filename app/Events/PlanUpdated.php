<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlanUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $planId;
    public $pacienteId;
    public $cambios;

    public function __construct($planId, $pacienteId, $cambios = [])
    {
        $this->planId = $planId;
        $this->pacienteId = $pacienteId;
        $this->cambios = $cambios;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->pacienteId);
    }

    public function broadcastWith()
    {
        return [
            'plan_id' => $this->planId,
            'paciente_id' => $this->pacienteId,
            'cambios' => $this->cambios,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs()
    {
        return 'plan.updated';
    }
}
