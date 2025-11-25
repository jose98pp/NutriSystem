<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\NotificationTracking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificarMenuDiario extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notificaciones:menu-diario';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones del menú diario a todos los pacientes con planes activos';

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
        $this->info('Iniciando notificación de menú diario...');
        
        try {
            $hoy = Carbon::now();
            
            // Obtener planes activos
            $planesActivos = PlanAlimentacion::whereDate('fecha_inicio', '<=', $hoy)
                ->whereDate('fecha_fin', '>=', $hoy)
                ->with(['paciente'])
                ->get();

            $this->info("Planes activos encontrados: {$planesActivos->count()}");

            $contador = 0;

            foreach ($planesActivos as $plan) {
                try {
                    // Obtener el menú del día actual
                    $planDia = PlanDia::where('id_plan', $plan->id_plan)
                        ->whereDate('fecha', $hoy->toDateString())
                        ->with(['comidas'])
                        ->first();

                    if (!$planDia || $planDia->comidas->isEmpty()) {
                        continue;
                    }

                    $paciente = $plan->paciente;
                    if (!$paciente || !$paciente->user_id) {
                        continue;
                    }

                    // Verificar si ya se envió notificación hoy
                    $tipoEvento = "menu_diario_{$hoy->format('Y-m-d')}";
                    
                    if (NotificationTracking::yaEnviada(
                        $tipoEvento,
                        $planDia->id_dia,
                        'plan_dia',
                        $paciente->user_id
                    )) {
                        continue;
                    }

                    // Enviar notificación
                    $this->notificationService->notificarMenuDiario($plan, $planDia);

                    // Registrar en tracking
                    NotificationTracking::registrar(
                        $tipoEvento,
                        $planDia->id_dia,
                        'plan_dia',
                        $paciente->user_id
                    );

                    $contador++;
                } catch (\Exception $e) {
                    Log::error('Error al notificar menú diario', [
                        'plan_id' => $plan->id_plan,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $this->info("✓ Proceso completado: {$contador} notificaciones enviadas");
            
            Log::info('NotificarMenuDiario ejecutado', [
                'notificaciones_enviadas' => $contador,
                'fecha' => $hoy->format('Y-m-d')
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            Log::error('Error en NotificarMenuDiario', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }
}
