<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CalendarioEntrega;
use App\Models\NotificationTracking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificarEntregasProximas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notificaciones:entregas-proximas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de entregas próximas (1 día antes)';

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
        $this->info('Iniciando notificación de entregas próximas...');
        
        try {
            $manana = Carbon::tomorrow();
            
            // Buscar calendarios de entrega que comienzan mañana
            $entregas = CalendarioEntrega::whereDate('fecha_inicio', $manana->toDateString())
                ->with(['contrato.paciente'])
                ->get();

            $this->info("Entregas próximas encontradas: {$entregas->count()}");

            $contador = 0;

            foreach ($entregas as $entrega) {
                try {
                    $contrato = $entrega->contrato;
                    if (!$contrato) {
                        continue;
                    }

                    $paciente = $contrato->paciente;
                    if (!$paciente || !$paciente->user_id) {
                        continue;
                    }

                    // Verificar si ya se envió notificación
                    if (NotificationTracking::yaEnviada(
                        'entrega_proxima',
                        $entrega->id_calendario,
                        'calendario_entrega',
                        $paciente->user_id
                    )) {
                        continue;
                    }

                    // Enviar notificación
                    $this->notificationService->notificarEntregaProxima($entrega);

                    // Registrar en tracking
                    NotificationTracking::registrar(
                        'entrega_proxima',
                        $entrega->id_calendario,
                        'calendario_entrega',
                        $paciente->user_id
                    );

                    $contador++;
                } catch (\Exception $e) {
                    Log::error('Error al notificar entrega próxima', [
                        'calendario_id' => $entrega->id_calendario,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $this->info("✓ Proceso completado: {$contador} notificaciones enviadas");
            
            Log::info('NotificarEntregasProximas ejecutado', [
                'notificaciones_enviadas' => $contador
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            Log::error('Error en NotificarEntregasProximas', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }
}
