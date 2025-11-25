<?php

namespace App\Console\Commands;

use App\Services\SessionStateManager;
use Illuminate\Console\Command;

class LimpiarSesionesHuerfanas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'videollamadas:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cierra sesiones de videollamada inactivas (más de 30 minutos sin actividad)';

    protected $sessionStateManager;

    /**
     * Create a new command instance.
     */
    public function __construct(SessionStateManager $sessionStateManager)
    {
        parent::__construct();
        $this->sessionStateManager = $sessionStateManager;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando limpieza de sesiones huérfanas...');

        $closedCount = $this->sessionStateManager->closeInactiveSessions();

        if ($closedCount > 0) {
            $this->info("✓ Se cerraron {$closedCount} sesiones inactivas");
        } else {
            $this->info('✓ No se encontraron sesiones inactivas');
        }

        return Command::SUCCESS;
    }
}
