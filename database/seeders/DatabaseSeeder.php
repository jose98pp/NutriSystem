<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usar el seeder completo y actualizado
        $this->call([
            CompleteDataSeeder::class,
        ]);
        
        // Seeders opcionales adicionales (comentados por defecto)
        // $this->call([
        //     AlimentosTableSeeder::class, // Más alimentos
        //     PlanesEvaluacionesSeeder::class, // Planes y evaluaciones
        //     NotificacionesMensajesSeeder::class, // Notificaciones y mensajes
        // ]);
    }
}
