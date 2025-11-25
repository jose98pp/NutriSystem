<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IngestaCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ingesta;
    public $pacienteId;

    public function __construct($ingesta, $pacienteId)
    {
        $this->ingesta = $ingesta;
        $this->pacienteId = $pacienteId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->pacienteId);
    }

    public function broadcastWith()
    {
        return [
            'ingesta' => [
                'id' => $this->ingesta->id_ingesta ?? $this->ingesta['id_ingesta'] ?? null,
                'fecha' => $this->ingesta->fecha ?? $this->ingesta['fecha'] ?? null,
                'tipo_comida' => $this->ingesta->tipo_comida ?? $this->ingesta['tipo_comida'] ?? null,
                'calorias' => $this->ingesta->calorias_totales ?? $this->ingesta['calorias_totales'] ?? 0,
                'proteinas' => $this->ingesta->proteinas_totales ?? $this->ingesta['proteinas_totales'] ?? 0,
                'carbohidratos' => $this->ingesta->carbohidratos_totales ?? $this->ingesta['carbohidratos_totales'] ?? 0,
                'grasas' => $this->ingesta->grasas_totales ?? $this->ingesta['grasas_totales'] ?? 0,
            ],
            'paciente_id' => $this->pacienteId,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function broadcastAs()
    {
        return 'ingesta.created';
    }
}
