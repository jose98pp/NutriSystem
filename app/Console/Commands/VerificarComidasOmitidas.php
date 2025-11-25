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

class VerificarComidasOmitidas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notificaciones:verificar-comidas-omitidas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica comidas omitidas y envía notificaciones de seguimiento';

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
        $this->info('Iniciando verificación de comidas omitidas...');
        
        try {
            $ahora = Carbon::now();
            $hace30Minutos = $ahora->copy()->subMinutes(30);
            
            // Obtener planes activos
            $planesActivos = PlanAlimentacion::whereDate('fecha_inicio', '<=', $ahora)
                ->whereDate('fecha_fin', '>=', $ahora)
                ->with(['paciente'])
                ->get();

            $this->info("Planes activos encontrados: {$planesActivos->count()}");

            $stats = [
                'seguimientos_enviados' => 0,
                'alertas_nutricionista' => 0,
            ];

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

                    $paciente = $plan->paciente;
                    if (!$paciente || !$paciente->user_id) {
                        continue;
                    }

                    // Verificar cada comida
                    $comidasOmitidas = 0;
                    
                    foreach ($planDia->comidas as $comida) {
                        if (!$comida->hora_recomendada) {
                            continue;
                        }

                        // Verificar si la hora de la comida fue hace más de 30 minutos
                        $horaComida = Carbon::createFromFormat('H:i', $comida->hora_recomendada);
                        $horaComidaHoy = $ahora->copy()->setTime($horaComida->hour, $horaComida->minute);

                        if ($horaComidaHoy->lt($hace30Minutos)) {
                            // Verificar si el paciente registró esta comida
                            $yaRegistro = Ingesta::where('id_paciente', $paciente->id_paciente)
                                ->where('tipo_comida', $comida->tipo_comida)
                                ->whereDate('fecha_hora', $ahora->toDateString())
                                ->exists();

                            if (!$yaRegistro) {
                                // Comida omitida
                                $comidasOmitidas++;
                                
                                // Enviar notificación de seguimiento al paciente
                                if ($this->enviarSeguimientoPaciente($planDia, $comida, $paciente, $ahora)) {
                                    $stats['seguimientos_enviados']++;
                                }
                            }
                        }
                    }

                    // Si omitió 2 o más comidas, alertar al nutricionista
                    if ($comidasOmitidas >= 2) {
                        if ($this->alertarNutricionista($paciente, $comidasOmitidas, $ahora)) {
                            $stats['alertas_nutricionista']++;
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Error al verificar comidas omitidas', [
                        'plan_id' => $plan->id_plan,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $this->info("✓ Proceso completado:");
            $this->info("  - Seguimientos enviados: {$stats['seguimientos_enviados']}");
            $this->info("  - Alertas a nutricionistas: {$stats['alertas_nutricionista']}");
            
            Log::info('VerificarComidasOmitidas ejecutado', $stats);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            Log::error('Error en VerificarComidasOmitidas', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Enviar notificación de seguimiento al paciente
     */
    protected function enviarSeguimientoPaciente(PlanDia $planDia, Comida $comida, $paciente, Carbon $ahora): bool
    {
        try {
            // Verificar si ya se envió seguimiento hoy para esta comida
            $tipoEvento = "comida_omitida_{$ahora->format('Y-m-d')}";
            
            if (NotificationTracking::yaEnviada(
                $tipoEvento,
                $comida->id_comida,
                'comida',
                $paciente->user_id
            )) {
                return false;
            }

            // Enviar notificación
            $this->notificationService->notificarComidaOmitida($planDia, $comida, $paciente);

            // Registrar en tracking
            NotificationTracking::registrar(
                $tipoEvento,
                $comida->id_comida,
                'comida',
                $paciente->user_id
            );

            return true;
        } catch (\Exception $e) {
            Log::error('Error al enviar seguimiento de comida omitida', [
                'comida_id' => $comida->id_comida,
                'paciente_id' => $paciente->id_paciente,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Alertar al nutricionista sobre comidas omitidas consecutivas
     */
    protected function alertarNutricionista($paciente, int $cantidad, Carbon $ahora): bool
    {
        try {
            // Verificar si ya se envió alerta hoy
            $tipoEvento = "alerta_comidas_omitidas_{$ahora->format('Y-m-d')}";
            
            if (NotificationTracking::yaEnviada(
                $tipoEvento,
                $paciente->id_paciente,
                'paciente',
                $paciente->nutricionista->user_id ?? 0
            )) {
                return false;
            }

            // Enviar notificación
            $this->notificationService->notificarComidasOmitidasConsecutivas($paciente, $cantidad);

            // Registrar en tracking
            if ($paciente->nutricionista && $paciente->nutricionista->user_id) {
                NotificationTracking::registrar(
                    $tipoEvento,
                    $paciente->id_paciente,
                    'paciente',
                    $paciente->nutricionista->user_id
                );
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Error al alertar nutricionista', [
                'paciente_id' => $paciente->id_paciente,
                'cantidad' => $cantidad,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
