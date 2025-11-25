<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PlanAlimentacion;
use App\Models\Paciente;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GenerarEntregasPlan extends Command
{
    protected $signature = 'plan:generar-entregas {plan_id?}';
    protected $description = 'Generar entregas programadas para un plan activo';

    public function handle()
    {
        $planId = $this->argument('plan_id');
        
        if (!$planId) {
            $plan = PlanAlimentacion::where('estado', 'ACTIVO')->first();
            if (!$plan) {
                $this->error('❌ No hay planes activos en el sistema');
                return 1;
            }
            $planId = $plan->id_plan;
        } else {
            $plan = PlanAlimentacion::find($planId);
            if (!$plan) {
                $this->error("❌ No se encontró el plan con ID: {$planId}");
                return 1;
            }
        }

        $this->info("📦 Generando entregas para plan: {$plan->nombre_plan}");
        $this->info("👤 Paciente ID: {$plan->id_paciente}");

        // Obtener el paciente y su dirección principal
        $paciente = Paciente::find($plan->id_paciente);
        if (!$paciente) {
            $this->error('❌ No se encontró el paciente');
            return 1;
        }

        // Buscar dirección principal del paciente
        $direccion = DB::table('direcciones')
            ->where('id_paciente', $paciente->id_paciente)
            ->where('es_principal', true)
            ->first();

        if (!$direccion) {
            // Si no hay dirección principal, tomar la primera
            $direccion = DB::table('direcciones')
                ->where('id_paciente', $paciente->id_paciente)
                ->first();
        }

        if (!$direccion) {
            $this->warn('⚠️  El paciente no tiene direcciones registradas');
            $this->info('Creando dirección de ejemplo...');
            
            // Crear dirección de ejemplo
            $idDireccion = DB::table('direcciones')->insertGetId([
                'id_paciente' => $paciente->id_paciente,
                'alias' => 'Casa',
                'descripcion' => 'Dirección principal',
                'direccion_completa' => 'Calle Principal #123',
                'ciudad' => 'Ciudad',
                'codigo_postal' => '00000',
                'es_principal' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $direccion = DB::table('direcciones')->where('id_direccion', $idDireccion)->first();
            $this->info("✓ Dirección creada: {$direccion->alias}");
        }

        // Crear o obtener contrato si no existe
        if (!$plan->id_contrato) {
            $this->warn('⚠️  El plan no tiene contrato asociado');
            $this->info('Creando contrato automáticamente...');
            
            // Buscar un servicio o crear uno genérico
            $servicio = DB::table('servicios')->first();
            if (!$servicio) {
                $idServicio = DB::table('servicios')->insertGetId([
                    'nombre' => 'Plan Nutricional',
                    'tipo_servicio' => 'plan_alimenticio',
                    'duracion_dias' => 30,
                    'costo' => 500.00,
                    'descripcion' => 'Servicio de plan nutricional personalizado',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $idServicio = $servicio->id_servicio;
            }
            
            // Crear contrato
            $idContrato = DB::table('contratos')->insertGetId([
                'id_paciente' => $paciente->id_paciente,
                'id_servicio' => $idServicio,
                'fecha_inicio' => $plan->fecha_inicio,
                'fecha_fin' => $plan->fecha_fin,
                'costo_contratado' => 500.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Actualizar el plan con el contrato
            DB::table('planes_alimentacion')
                ->where('id_plan', $plan->id_plan)
                ->update(['id_contrato' => $idContrato]);
            
            $plan->id_contrato = $idContrato;
            $this->info("✓ Contrato creado (ID: {$idContrato})");
        }
        
        // Crear o obtener calendario de entregas
        $calendario = DB::table('calendario_entrega')
            ->where('id_contrato', $plan->id_contrato)
            ->first();

        if (!$calendario) {
            $this->info('📅 Creando calendario de entregas...');
            
            $idCalendario = DB::table('calendario_entrega')->insertGetId([
                'id_contrato' => $plan->id_contrato,
                'fecha_inicio' => $plan->fecha_inicio,
                'fecha_fin' => $plan->fecha_fin,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $calendario = DB::table('calendario_entrega')->where('id_calendario', $idCalendario)->first();
            $this->info("✓ Calendario creado (ID: {$calendario->id_calendario})");
        }

        // Generar entregas para las próximas 4 semanas
        $this->info("\n📦 Generando entregas programadas...");
        
        $fechaInicio = Carbon::parse($plan->fecha_inicio);
        $fechaFin = Carbon::parse($plan->fecha_fin);
        $fechaActual = Carbon::now()->startOfDay();
        
        // Si el plan ya empezó, usar la fecha actual
        if ($fechaInicio->lt($fechaActual)) {
            $fechaInicio = $fechaActual;
        }

        // Generar entregas para las próximas 4 semanas o hasta el fin del plan
        $fechaLimite = $fechaInicio->copy()->addWeeks(4);
        if ($fechaLimite->gt($fechaFin)) {
            $fechaLimite = $fechaFin;
        }

        $diasEntrega = ['LUNES', 'MIERCOLES', 'VIERNES']; // 3 entregas por semana
        $entregasCreadas = 0;

        $fecha = $fechaInicio->copy();
        while ($fecha->lte($fechaLimite)) {
            $diaSemana = strtoupper($fecha->locale('es')->dayName);
            
            if (in_array($diaSemana, $diasEntrega)) {
                // Verificar si ya existe una entrega para esta fecha
                $entregaExistente = DB::table('entrega_programada')
                    ->where('id_calendario', $calendario->id_calendario)
                    ->where('fecha', $fecha->format('Y-m-d'))
                    ->exists();

                if (!$entregaExistente) {
                    // Obtener una comida del día (preferiblemente almuerzo)
                    $planDia = DB::table('plan_dias')
                        ->where('id_plan', $plan->id_plan)
                        ->where('dia_semana', $diaSemana)
                        ->first();

                    $idComida = null;
                    if ($planDia) {
                        $comida = DB::table('comidas')
                            ->where('id_dia', $planDia->id_dia)
                            ->where('tipo_comida', 'ALMUERZO')
                            ->first();
                        
                        if (!$comida) {
                            // Si no hay almuerzo, tomar cualquier comida
                            $comida = DB::table('comidas')
                                ->where('id_dia', $planDia->id_dia)
                                ->first();
                        }
                        
                        if ($comida) {
                            $idComida = $comida->id_comida;
                        }
                    }

                    // Crear entrega
                    DB::table('entrega_programada')->insert([
                        'id_calendario' => $calendario->id_calendario,
                        'id_direccion' => $direccion->id_direccion,
                        'id_comida' => $idComida,
                        'fecha' => $fecha->format('Y-m-d'),
                        'estado' => 'PROGRAMADA',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $entregasCreadas++;
                    $this->info("  ✓ {$diaSemana} {$fecha->format('d/m/Y')} - Entrega programada");
                }
            }

            $fecha->addDay();
        }

        $this->info("\n✅ ¡Entregas generadas exitosamente!");
        $this->info("\n📊 Resumen:");
        $this->info("  • Calendario ID: {$calendario->id_calendario}");
        $this->info("  • Dirección: {$direccion->alias}");
        $this->info("  • Entregas creadas: {$entregasCreadas}");
        $this->info("  • Frecuencia: 3 entregas por semana (Lun, Mié, Vie)");
        $this->info("  • Período: {$fechaInicio->format('d/m/Y')} - {$fechaLimite->format('d/m/Y')}");
        
        $this->info("\n🎯 Próximos pasos:");
        $this->info("  1. Ve a 'Mis Entregas' en la aplicación");
        $this->info("  2. Deberías ver las entregas programadas");
        $this->info("  3. Verifica las fechas y direcciones");
        
        return 0;
    }
}
