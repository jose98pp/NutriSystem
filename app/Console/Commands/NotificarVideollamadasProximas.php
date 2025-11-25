<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sesion;
use App\Models\NotificationTracking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificarVideollamadasProximas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notificaciones:videollamadas-proximas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de videollamadas próximas (5 minutos antes)';

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
        $this->info('Iniciando notificación de videollamadas próximas...');
        
        try {
            $ahora = Carbon::now();
            $en5Minutos = Carbon::now()->addMinutes(5);
            $en3Minutos = Carbon::now()->addMinutes(3);

            // Buscar videollamadas programadas entre 3 y 5 minutos desde ahora
            $videollamadas = Sesion::where('estado', 'PROGRAMADA')
                ->where('tipo_sesion', 'VIDEOLLAMADA')
                ->whereBetween('fecha_hora', [$en3Minutos, $en5Minutos])
                ->with(['paciente'])
                ->get();

            $this->info("Videollamadas próximas encontradas: {$videollamadas->count()}");

            $contador = 0;

            foreach ($videollamadas as $videollamada) {
                try {
                    $paciente = $videollamada->paciente;
                    
                    // Notificar al paciente
                    if ($paciente && $paciente->user_id) {
                        // Verificar si ya se envió notificación
                        if (!NotificationTracking::yaEnviada(
                            'videollamada_proxima_5min',
                            $videollamada->id_sesion,
                            'sesion',
                            $paciente->user_id
                        )) {
                            // Enviar notificación
                            $this->notificationService->notificarVideollamadaProxima($videollamada);

                            // Registrar en tracking
                            NotificationTracking::registrar(
                                'videollamada_proxima_5min',
                                $videollamada->id_sesion,
                                'sesion',
                                $paciente->user_id
                            );

                            $contador++;
                        }
                    }

                    // Notificar al profesional
                    $profesional = $videollamada->profesional();
                    if ($profesional && method_exists($profesional, 'first')) {
                        $prof = $profesional->first();
                        if ($prof && isset($prof->user_id)) {
                            // Verificar si ya se envió notificación al profesional
                            if (!NotificationTracking::yaEnviada(
                                'videollamada_proxima_5min_profesional',
                                $videollamada->id_sesion,
                                'sesion',
                                $prof->user_id
                            )) {
                                // La notificación al profesional ya está incluida en notificarVideollamadaProxima
                                // Solo registrar en tracking
                                NotificationTracking::registrar(
                                    'videollamada_proxima_5min_profesional',
                                    $videollamada->id_sesion,
                                    'sesion',
                                    $prof->user_id
                                );
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Error al notificar videollamada', [
                        'sesion_id' => $videollamada->id_sesion,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $this->info("✓ Proceso completado: {$contador} notificaciones enviadas");
            
            Log::info('NotificarVideollamadasProximas ejecutado', [
                'notificaciones_enviadas' => $contador
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            Log::error('Error en NotificarVideollamadasProximas', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }
}
