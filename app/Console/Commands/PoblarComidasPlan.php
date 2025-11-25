<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PlanAlimentacion;
use App\Models\Alimento;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PoblarComidasPlan extends Command
{
    protected $signature = 'plan:poblar-comidas {plan_id?}';
    protected $description = 'Poblar comidas de ejemplo para un plan activo';

    public function handle()
    {
        $planId = $this->argument('plan_id');
        
        if (!$planId) {
            $plan = PlanAlimentacion::where('estado', 'ACTIVO')->first();
            if (!$plan) {
                $this->error('❌ No hay planes activos en el sistema');
                $this->info('Crea un plan primero desde la interfaz web');
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

        $this->info("📋 Poblando comidas para plan: {$plan->nombre_plan}");
        $this->info("👤 Paciente ID: {$plan->id_paciente}");

        // Verificar que hay alimentos en la base de datos
        $totalAlimentos = Alimento::count();
        if ($totalAlimentos < 10) {
            $this->warn("⚠️  Solo hay {$totalAlimentos} alimentos en la base de datos");
            $this->info('Se recomienda tener al menos 10 alimentos para crear comidas variadas');
        }

        DB::beginTransaction();
        try {
            // Crear días de la semana
            $diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
            $fechaInicio = Carbon::today()->startOfWeek();

            $this->info("\n🗓️  Creando días de la semana...");
            
            foreach ($diasSemana as $index => $dia) {
                $fecha = $fechaInicio->copy()->addDays($index);
                
                // Crear o actualizar día del plan
                $planDia = DB::table('plan_dias')->updateOrInsert(
                    [
                        'id_plan' => $plan->id_plan,
                        'dia_semana' => $dia,
                    ],
                    [
                        'fecha' => $fecha->format('Y-m-d'),
                        'dia_index' => $index + 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

                $idDia = DB::table('plan_dias')
                    ->where('id_plan', $plan->id_plan)
                    ->where('dia_semana', $dia)
                    ->value('id_dia');

                // Crear comidas para este día
                $comidas = [
                    ['tipo' => 'DESAYUNO', 'nombre' => 'Desayuno Proteico', 'hora' => '08:00:00', 'orden' => 1, 'instrucciones' => 'Preparar con leche descremada'],
                    ['tipo' => 'COLACION_MATUTINA', 'nombre' => 'Snack Matutino', 'hora' => '10:30:00', 'orden' => 2, 'instrucciones' => 'Fruta fresca de temporada'],
                    ['tipo' => 'ALMUERZO', 'nombre' => 'Almuerzo Balanceado', 'hora' => '13:00:00', 'orden' => 3, 'instrucciones' => 'Proteína + vegetales + carbohidrato complejo'],
                    ['tipo' => 'COLACION_VESPERTINA', 'nombre' => 'Snack Vespertino', 'hora' => '16:00:00', 'orden' => 4, 'instrucciones' => 'Frutos secos o yogurt'],
                    ['tipo' => 'CENA', 'nombre' => 'Cena Ligera', 'hora' => '19:00:00', 'orden' => 5, 'instrucciones' => 'Proteína magra + ensalada'],
                ];

                foreach ($comidas as $comidaData) {
                    // Verificar si ya existe la comida
                    $comidaExistente = DB::table('comidas')
                        ->where('id_dia', $idDia)
                        ->where('tipo_comida', $comidaData['tipo'])
                        ->first();

                    if ($comidaExistente) {
                        // Actualizar comida existente
                        DB::table('comidas')
                            ->where('id_comida', $comidaExistente->id_comida)
                            ->update([
                                'nombre' => $comidaData['nombre'],
                                'hora_recomendada' => $comidaData['hora'],
                                'orden' => $comidaData['orden'],
                                'instrucciones' => $comidaData['instrucciones'],
                                'updated_at' => now(),
                            ]);
                        $idComida = $comidaExistente->id_comida;
                        
                        // Eliminar alimentos anteriores
                        DB::table('alimento_comida')->where('id_comida', $idComida)->delete();
                    } else {
                        // Crear nueva comida
                        $idComida = DB::table('comidas')->insertGetId([
                            'id_dia' => $idDia,
                            'tipo_comida' => $comidaData['tipo'],
                            'nombre' => $comidaData['nombre'],
                            'hora_recomendada' => $comidaData['hora'],
                            'orden' => $comidaData['orden'],
                            'instrucciones' => $comidaData['instrucciones'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    // Agregar alimentos de ejemplo (3-4 alimentos por comida)
                    $cantidadAlimentos = rand(3, 4);
                    $alimentos = Alimento::inRandomOrder()->limit($cantidadAlimentos)->get();
                    
                    foreach ($alimentos as $alimento) {
                        DB::table('alimento_comida')->insert([
                            'id_comida' => $idComida,
                            'id_alimento' => $alimento->id_alimento,
                            'cantidad_gramos' => rand(50, 200),
                        ]);
                    }
                }

                $this->info("  ✓ {$dia} ({$fecha->format('d/m/Y')}) - 5 comidas creadas");
            }

            DB::commit();

            $this->info("\n✅ ¡Comidas pobladas exitosamente!");
            $this->info("\n📊 Resumen:");
            $this->info("  • 7 días creados");
            $this->info("  • 35 comidas creadas (5 por día)");
            $this->info("  • ~120 alimentos asignados");
            
            $this->info("\n🎯 Próximos pasos:");
            $this->info("  1. Ve a 'Mis Comidas de Hoy' en la aplicación");
            $this->info("  2. Deberías ver las comidas del día actual");
            $this->info("  3. Haz click en 'Ya comí esto' para registrar");
            
            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("\n❌ Error al poblar comidas: " . $e->getMessage());
            $this->error("Línea: " . $e->getLine());
            return 1;
        }
    }
}
