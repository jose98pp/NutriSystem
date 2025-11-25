<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Sesion;
use App\Models\NotificationTracking;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class NotificarSesionesProximas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notificaciones:sesiones-proximas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía notificaciones de sesiones próximas (24h y 1h antes)';

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
        $this->info('Iniciando notificación de sesiones próximas...');
        
        $stats = [
            'sesiones_24h' => 0,
            'sesiones_1h' => 0,
            'errores' => 0,
        ];

        try {
            // Notificar sesiones en las próximas 24 horas
            $stats['sesiones_24h'] = $this->notificarSesiones24Horas();
            
            // Notificar sesiones en la próxima 1 hora
            $stats['sesiones_1h'] = $this->notificarSesiones1Hora();

            $this->info("✓ Proceso completado:");
            $this->info("  - Sesiones 24h: {$stats['sesiones_24h']} notificaciones enviadas");
            $this->info("  - Sesiones 1h: {$stats['sesiones_1h']} notificaciones enviadas");
            
            Log::info('NotificarSesionesProximas ejecutado', $stats);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            Log::error('Error en NotificarSesionesProximas', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Notificar sesiones en las próximas 24 horas
     */
    protected function notificarSesiones24Horas(): int
    {
        $ahora = Carbon::now();
        $en24Horas = Carbon::now()->addHours(24);
        $en23Horas = Carbon::now()->addHours(23);

        // Buscar sesiones programadas entre 23 y 24 horas desde ahora
        $sesiones = Sesion::where('estado', 'PROGRAMADA')
            ->whereBetween('fecha_hora', [$en23Horas, $en24Horas])
            ->with(['paciente'])
            ->get();

        $contador = 0;

        foreach ($sesiones as $sesion) {
            try {
                if (!$sesion->paciente || !$sesion->paciente->user_id) {
                    continue;
                }

                // Verificar si ya se envió esta notificación
                if (NotificationTracking::yaEnviada(
                    'sesion_proxima_24h',
                    $sesion->id_sesion,
                    'sesion',
                    $sesion->paciente->user_id
                )) {
                    continue;
                }

                // Enviar notificación
                $this->notificationService->notificarSesionProxima($sesion, 24);

                // Registrar en tracking
                NotificationTracking::registrar(
                    'sesion_proxima_24h',
                    $sesion->id_sesion,
                    'sesion',
                    $sesion->paciente->user_id
                );

                $contador++;
            } catch (\Exception $e) {
                Log::error('Error al notificar sesión 24h', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $contador;
    }

    /**
     * Notificar sesiones en la próxima 1 hora
     */
    protected function notificarSesiones1Hora(): int
    {
        $ahora = Carbon::now();
        $en1Hora = Carbon::now()->addHour();
        $en50Minutos = Carbon::now()->addMinutes(50);

        // Buscar sesiones programadas entre 50 minutos y 1 hora desde ahora
        $sesiones = Sesion::where('estado', 'PROGRAMADA')
            ->whereBetween('fecha_hora', [$en50Minutos, $en1Hora])
            ->with(['paciente'])
            ->get();

        $contador = 0;

        foreach ($sesiones as $sesion) {
            try {
                if (!$sesion->paciente || !$sesion->paciente->user_id) {
                    continue;
                }

                // Verificar si ya se envió esta notificación
                if (NotificationTracking::yaEnviada(
                    'sesion_proxima_1h',
                    $sesion->id_sesion,
                    'sesion',
                    $sesion->paciente->user_id
                )) {
                    continue;
                }

                // Enviar notificación
                $this->notificationService->notificarSesionProxima($sesion, 1);

                // Registrar en tracking
                NotificationTracking::registrar(
                    'sesion_proxima_1h',
                    $sesion->id_sesion,
                    'sesion',
                    $sesion->paciente->user_id
                );

                $contador++;
            } catch (\Exception $e) {
                Log::error('Error al notificar sesión 1h', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $contador;
    }
}
