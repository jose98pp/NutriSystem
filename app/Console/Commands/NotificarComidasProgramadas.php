<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Models\Ingesta;
use App\Models\NotificationTracking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificarComidasProgramadas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notificaciones:comidas-programadas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de comidas programadas para la hora actual';

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando notificación de comidas programadas...');
        
        try {
            $ahora = Carbon::now();
            $horaActual = $ahora->format('H:i');
            
            // Rango de ±15 minutos
            $horaInicio = $ahora->copy()->subMinutes(15)->format('H:i');
            $horaFin = $ahora->copy()->addMinutes(15)->format('H:i');

            $this->info("Buscando comidas programadas entre {$horaInicio} y {$horaFin}");

            // Obtener planes activos
            $planesActivos = PlanAlimentacion::whereDate('fecha_inicio', '<=', $ahora)
                ->whereDate('fecha_fin', '>=', $ahora)
                ->with(['paciente'])
                ->get();

            $this->info("Planes activos encontrados: {$planesActivos->count()}");

            $contador = 0;

            foreach ($planesActivos as $plan) {
                try {
                    // Obtener el día actual del plan
                    $planDia = PlanDia::where('id_plan', $plan->id_plan)
                        ->whereDate('fecha', $ahora->toDateString())
                        ->with(['comidas'])
                        ->first();

                    if (!$planDia) {
                        continue;
                    }

                    // Buscar comidas en el rango de hora
                    foreach ($planDia->comidas as $comida) {
                        if (!$comida->hora_recomendada) {
                            continue;
                        }

                        // Verificar si la hora de la comida está en el rango
                        if ($this->estaEnRango($comida->hora_recomendada, $horaInicio, $horaFin)) {
                            $notificado = $this->notificarComida($planDia, $comida, $plan->paciente, $ahora);
                            if ($notificado) {
                                $contador++;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Error al procesar plan', [
                        'plan_id' => $plan->id_plan,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $this->info("✓ Proceso completado: {$contador} notificaciones enviadas");
            
            Log::info('NotificarComidasProgramadas ejecutado', [
                'notificaciones_enviadas' => $contador,
                'hora' => $horaActual
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            Log::error('Error en NotificarComidasProgramadas', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Verificar si una hora está en el rango
     */
    protected function estaEnRango(string $hora, string $horaInicio, string $horaFin): bool
    {
        return $hora >= $horaInicio && $hora <= $horaFin;
    }

    /**
     * Notificar una comida específica
     */
    protected function notificarComida(PlanDia $planDia, Comida $comida, $paciente, Carbon $ahora): bool
    {
        try {
            if (!$paciente || !$paciente->user_id) {
                return false;
            }

            // Verificar si ya se envió notificación hoy para esta comida
            $tipoEvento = "comida_programada_{$ahora->format('Y-m-d')}";
            
            if (NotificationTracking::yaEnviada(
                $tipoEvento,
                $comida->id_comida,
                'comida',
                $paciente->user_id
            )) {
                return false;
            }

            // Verificar si el paciente ya registró esta comida hoy
            $yaRegistro = Ingesta::where('id_paciente', $paciente->id_paciente)
                ->where('tipo_comida', $comida->tipo_comida)
                ->whereDate('fecha_hora', $ahora->toDateString())
                ->exists();

            if ($yaRegistro) {
                // Ya comió, no notificar
                return false;
            }

            // Enviar notificación
            $this->notificationService->notificarComidaProgramada($planDia, $comida, $paciente);

            // Registrar en tracking
            NotificationTracking::registrar(
                $tipoEvento,
                $comida->id_comida,
                'comida',
                $paciente->user_id
            );

            return true;
        } catch (\Exception $e) {
            Log::error('Error al notificar comida', [
                'comida_id' => $comida->id_comida,
                'paciente_id' => $paciente->id_paciente,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
