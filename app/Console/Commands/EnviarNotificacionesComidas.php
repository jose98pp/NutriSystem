<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PlanAlimentacion;
use App\Models\Notification;
use App\Models\Ingesta;
use Carbon\Carbon;

class EnviarNotificacionesComidas extends Command
{
    protected $signature = 'notificaciones:comidas';
    protected $description = 'Enviar notificaciones a pacientes sobre sus comidas programadas';

    public function handle()
    {
        $ahora = Carbon::now();
        $horaActual = $ahora->format('H:i');
        $diaSemana = strtoupper($ahora->locale('es')->dayName);
        $fecha = $ahora->toDateString();

        $this->info("Verificando comidas para {$diaSemana} a las {$horaActual}");

        // Obtener planes activos
        $planes = PlanAlimentacion::where('estado', 'ACTIVO')
            ->with(['paciente.user', 'planDias' => function($query) use ($diaSemana, $fecha) {
                $query->where(function($q) use ($diaSemana, $fecha) {
                    $q->where('dia_semana', $diaSemana)
                      ->orWhereDate('fecha', $fecha);
                })->with(['comidas' => function($q) use ($horaActual) {
                    // Buscar comidas en los próximos 15 minutos
                    $q->whereBetween('hora_recomendada', [
                        $horaActual,
                        Carbon::now()->addMinutes(15)->format('H:i')
                    ]);
                }]);
            }])
            ->get();

        $notificacionesEnviadas = 0;

        foreach ($planes as $plan) {
            foreach ($plan->planDias as $dia) {
                foreach ($dia->comidas as $comida) {
                    // Verificar si ya consumió esta comida hoy
                    $yaConsumida = Ingesta::where('id_paciente', $plan->id_paciente)
                        ->whereDate('fecha_hora', $fecha)
                        ->whereHas('alimentos', function($query) use ($comida) {
                            $alimentosIds = $comida->alimentos->pluck('id_alimento')->toArray();
                            $query->whereIn('id_alimento', $alimentosIds);
                        })
                        ->exists();

                    if (!$yaConsumida && $plan->paciente && $plan->paciente->user) {
                        // Crear notificación
                        Notification::create([
                            'id_usuario' => $plan->paciente->user->id,
                            'tipo' => 'info',
                            'titulo' => '🍽️ Hora de tu ' . ucfirst(strtolower($comida->tipo_comida)),
                            'mensaje' => "Es hora de tu {$comida->nombre}. Recuerda registrar tu ingesta.",
                            'link' => '/mis-comidas-hoy',
                            'leida' => false
                        ]);

                        $notificacionesEnviadas++;
                        $this->info("Notificación enviada a {$plan->paciente->user->name} para {$comida->tipo_comida}");
                    }
                }
            }
        }

        $this->info("Total de notificaciones enviadas: {$notificacionesEnviadas}");
        return 0;
    }
}
