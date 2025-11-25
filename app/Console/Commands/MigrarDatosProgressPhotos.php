<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrarDatosProgressPhotos extends Command
{
    protected $signature = 'progress-photos:migrar-datos';
    protected $description = 'Migrar datos de progress_photos de user_id a id_paciente';

    public function handle()
    {
        $this->info('Iniciando migración de datos...');
        
        $fotos = DB::table('progress_photos')->get();
        $actualizadas = 0;
        $noEncontradas = 0;
        
        foreach ($fotos as $foto) {
            // Buscar el paciente por user_id
            $paciente = DB::table('pacientes')
                ->where('user_id', $foto->id_paciente)
                ->first();
            
            if ($paciente) {
                // Actualizar con el id_paciente correcto
                DB::table('progress_photos')
                    ->where('id_foto', $foto->id_foto)
                    ->update(['id_paciente' => $paciente->id_paciente]);
                
                $this->line("✓ Foto {$foto->id_foto}: user_id {$foto->id_paciente} → id_paciente {$paciente->id_paciente}");
                $actualizadas++;
            } else {
                $this->warn("✗ Foto {$foto->id_foto}: No se encontró paciente con user_id {$foto->id_paciente}");
                $noEncontradas++;
            }
        }
        
        $this->info("\nMigración completada:");
        $this->info("- Fotos actualizadas: {$actualizadas}");
        if ($noEncontradas > 0) {
            $this->warn("- Fotos sin paciente: {$noEncontradas}");
        }
        
        return 0;
    }
}
