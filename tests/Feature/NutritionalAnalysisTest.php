<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Paciente;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Models\Alimento;
use App\Models\Receta;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests para análisis nutricional avanzado
 * Feature: mejoras-sistema-core, Fase 2
 */
class NutritionalAnalysisTest extends TestCase
{
    use RefreshDatabase;

    protected $nutricionista;
    protected $paciente;
    protected $plan;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear nutricionista
        $userNutricionista = User::factory()->create([
            'email' => 'nutricionista@test.com',
            'role' => 'nutricionista'
        ]);

        $this->nutricionista = Nutricionista::create([
            'user_id' => $userNutricionista->id,
            'nombre' => 'Dr. Test',
            'apellido' => 'Nutricionista',
            'email' => 'nutricionista@test.com',
            'especialidad' => 'Nutrición Deportiva',
            'telefono' => '1234567890'
        ]);

        // Crear paciente
        $userPaciente = User::factory()->create([
            'email' => 'paciente@test.com',
            'role' => 'paciente'
        ]);

        $this->paciente = Paciente::create([
            'user_id' => $userPaciente->id,
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'email' => 'paciente@test.com',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
            'telefono' => '0987654321',
            'altura' => 175,
            'peso_actual' => 80
        ]);

        // Crear plan
        $this->plan = PlanAlimentacion::create([
            'id_nutricionista' => $this->nutricionista->id_nutricionista,
            'id_paciente' => $this->paciente->id_paciente,
            'nombre' => 'Plan Test',
            'objetivo' => 'Pérdida de peso',
            'calorias_objetivo' => 2000,
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addDays(7),
            'activo' => true
        ]);
    }

    /** @test */
    public function test_calculo_macronutrientes_comida()
    {
        // Crear día
        $dia = PlanDia::create([
            'id_plan' => $this->plan->id_plan,
            'dia_numero' => 1,
            'dia_index' => 0,
            'fecha' => now()
        ]);

        // Crear comida
        $comida = Comida::create([
            'id_dia' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'nombre' => 'Desayuno Test',
            'descripcion' => 'Desayuno de prueba',
            'hora_recomendada' => '08:00',
            'opcion_numero' => 1,
            'es_alternativa' => false
        ]);

        // Crear alimentos con valores nutricionales
        $alimento1 = Alimento::create([
            'nombre' => 'Avena',
            'categoria' => 'cereales',
            'calorias_por_100g' => 389,
            'proteinas_por_100g' => 16.9,
            'carbohidratos_por_100g' => 66.3,
            'grasas_por_100g' => 6.9,
            'fibra_por_100g' => 10.6,
            'disponible' => true
        ]);

        $alimento2 = Alimento::create([
            'nombre' => 'Leche',
            'categoria' => 'lacteos',
            'calorias_por_100g' => 61,
            'proteinas_por_100g' => 3.2,
            'carbohidratos_por_100g' => 4.8,
            'grasas_por_100g' => 3.3,
            'fibra_por_100g' => 0,
            'disponible' => true
        ]);

        // Asociar alimentos a la comida
        $comida->alimentos()->attach($alimento1->id_alimento, ['cantidad_gramos' => 50]);
        $comida->alimentos()->attach($alimento2->id_alimento, ['cantidad_gramos' => 200]);

        // Autenticar como nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Hacer petición
        $response = $this->getJson("/api/analisis-nutricional/comida/{$comida->id_comida}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'comida',
                        'macronutrientes' => [
                            'calorias',
                            'proteinas',
                            'carbohidratos',
                            'grasas',
                            'fibra'
                        ],
                        'analisis_completo'
                    ]
                ]);

        // Verificar cálculos
        $data = $response->json('data');
        
        // Cálculo esperado:
        // Avena 50g: 389*0.5 = 194.5 cal, 16.9*0.5 = 8.45 prot
        // Leche 200g: 61*2 = 122 cal, 3.2*2 = 6.4 prot
        // Total: 316.5 cal, 14.85 prot
        
        $this->assertGreaterThan(300, $data['macronutrientes']['calorias']);
        $this->assertLessThan(330, $data['macronutrientes']['calorias']);
        $this->assertGreaterThan(14, $data['macronutrientes']['proteinas']);
        $this->assertLessThan(16, $data['macronutrientes']['proteinas']);
    }

    /** @test */
    public function test_analisis_dia_completo()
    {
        // Crear día
        $dia = PlanDia::create([
            'id_plan' => $this->plan->id_plan,
            'dia_numero' => 1,
            'dia_index' => 0,
            'fecha' => now()
        ]);

        // Crear múltiples comidas
        $comidas = ['desayuno', 'almuerzo', 'cena'];
        
        foreach ($comidas as $tipo) {
            $comida = Comida::create([
                'id_dia' => $dia->id_dia,
                'tipo_comida' => $tipo,
                'nombre' => ucfirst($tipo) . ' Test',
                'descripcion' => 'Comida de prueba',
                'hora_recomendada' => '08:00',
                'opcion_numero' => 1,
                'es_alternativa' => false
            ]);

            // Agregar alimento
            $alimento = Alimento::create([
                'nombre' => 'Alimento ' . $tipo,
                'categoria' => 'varios',
                'calorias_por_100g' => 200,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 30,
                'grasas_por_100g' => 5,
                'fibra_por_100g' => 3,
                'disponible' => true
            ]);

            $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 100]);
        }

        // Autenticar como nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Hacer petición
        $response = $this->getJson("/api/analisis-nutricional/dia/{$dia->id_dia}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'fecha',
                        'dia_numero',
                        'total_macronutrientes',
                        'comidas',
                        'distribucion_calorica'
                    ]
                ]);

        $data = $response->json('data');
        
        // Verificar que hay 3 comidas
        $this->assertCount(3, $data['comidas']);
        
        // Verificar que el total es la suma de las comidas
        // 3 comidas * 200 cal = 600 cal
        $this->assertEquals(600, $data['total_macronutrientes']['calorias']);
    }

    /** @test */
    public function test_analisis_plan_completo()
    {
        // Crear 3 días con comidas
        for ($i = 0; $i < 3; $i++) {
            $dia = PlanDia::create([
                'id_plan' => $this->plan->id_plan,
                'dia_numero' => $i + 1,
                'dia_index' => $i,
                'fecha' => now()->addDays($i)
            ]);

            $comida = Comida::create([
                'id_dia' => $dia->id_dia,
                'tipo_comida' => 'desayuno',
                'nombre' => 'Desayuno día ' . ($i + 1),
                'descripcion' => 'Comida de prueba',
                'hora_recomendada' => '08:00',
                'opcion_numero' => 1,
                'es_alternativa' => false
            ]);

            $alimento = Alimento::create([
                'nombre' => 'Alimento día ' . ($i + 1),
                'categoria' => 'varios',
                'calorias_por_100g' => 300,
                'proteinas_por_100g' => 15,
                'carbohidratos_por_100g' => 40,
                'grasas_por_100g' => 8,
                'fibra_por_100g' => 5,
                'disponible' => true
            ]);

            $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 100]);
        }

        // Autenticar como nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Hacer petición
        $response = $this->getJson("/api/analisis-nutricional/plan/{$this->plan->id_plan}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id_plan',
                        'nombre_plan',
                        'duracion_dias',
                        'promedio_diario',
                        'total_plan',
                        'dias',
                        'variabilidad'
                    ]
                ]);

        $data = $response->json('data');
        
        // Verificar que hay 3 días
        $this->assertCount(3, $data['dias']);
        
        // Verificar promedio diario
        // 3 días * 300 cal = 900 cal total / 3 días = 300 cal promedio
        $this->assertEquals(300, $data['promedio_diario']['calorias']);
        $this->assertEquals(900, $data['total_plan']['calorias']);
    }

    /** @test */
    public function test_comparacion_con_objetivos()
    {
        // Crear día con comida
        $dia = PlanDia::create([
            'id_plan' => $this->plan->id_plan,
            'dia_numero' => 1,
            'dia_index' => 0,
            'fecha' => now()
        ]);

        $comida = Comida::create([
            'id_dia' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'nombre' => 'Desayuno Test',
            'descripcion' => 'Comida de prueba',
            'hora_recomendada' => '08:00',
            'opcion_numero' => 1,
            'es_alternativa' => false
        ]);

        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'varios',
            'calorias_por_100g' => 2000,
            'proteinas_por_100g' => 100,
            'carbohidratos_por_100g' => 250,
            'grasas_por_100g' => 70,
            'fibra_por_100g' => 30,
            'disponible' => true
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 100]);

        // Autenticar como nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Definir objetivos
        $objetivos = [
            'calorias' => 2000,
            'proteinas' => 100,
            'carbohidratos' => 250,
            'grasas' => 70,
            'fibra' => 30
        ];

        // Hacer petición
        $response = $this->postJson("/api/analisis-nutricional/plan/{$this->plan->id_plan}/comparar-objetivos", [
            'objetivos' => $objetivos
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'plan',
                        'objetivos',
                        'analisis',
                        'comparacion' => [
                            'cumplimiento',
                            'recomendaciones',
                            'score_general'
                        ]
                    ]
                ]);

        $data = $response->json('data');
        
        // Verificar que hay comparación para cada nutriente
        $this->assertArrayHasKey('calorias', $data['comparacion']['cumplimiento']);
        $this->assertArrayHasKey('proteinas', $data['comparacion']['cumplimiento']);
        
        // Verificar que cada comparación tiene los campos necesarios
        $this->assertArrayHasKey('objetivo', $data['comparacion']['cumplimiento']['calorias']);
        $this->assertArrayHasKey('actual', $data['comparacion']['cumplimiento']['calorias']);
        $this->assertArrayHasKey('porcentaje_cumplimiento', $data['comparacion']['cumplimiento']['calorias']);
        $this->assertArrayHasKey('estado', $data['comparacion']['cumplimiento']['calorias']);
    }

    /** @test */
    public function test_generacion_reporte_completo()
    {
        // Crear día con comida
        $dia = PlanDia::create([
            'id_plan' => $this->plan->id_plan,
            'dia_numero' => 1,
            'dia_index' => 0,
            'fecha' => now()
        ]);

        $comida = Comida::create([
            'id_dia' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'nombre' => 'Desayuno Test',
            'descripcion' => 'Comida de prueba',
            'hora_recomendada' => '08:00',
            'opcion_numero' => 1,
            'es_alternativa' => false
        ]);

        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'varios',
            'calorias_por_100g' => 300,
            'proteinas_por_100g' => 15,
            'carbohidratos_por_100g' => 40,
            'grasas_por_100g' => 8,
            'fibra_por_100g' => 5,
            'disponible' => true
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 100]);

        // Autenticar como nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Hacer petición
        $response = $this->postJson("/api/analisis-nutricional/plan/{$this->plan->id_plan}/reporte");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'fecha_generacion',
                        'analisis_plan',
                        'resumen_ejecutivo',
                        'graficos_recomendados',
                        'plan_info'
                    ]
                ]);

        $data = $response->json('data');
        
        // Verificar que el reporte tiene información del plan
        $this->assertEquals($this->plan->id_plan, $data['plan_info']['id']);
        $this->assertEquals($this->plan->nombre_plan, $data['plan_info']['nombre']);
    }

    /** @test */
    public function test_resumen_nutricional_dashboard()
    {
        // Crear día con comida
        $dia = PlanDia::create([
            'id_plan' => $this->plan->id_plan,
            'dia_numero' => 1,
            'dia_index' => 0,
            'fecha' => now()
        ]);

        $comida = Comida::create([
            'id_dia' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'nombre' => 'Desayuno Test',
            'descripcion' => 'Comida de prueba',
            'hora_recomendada' => '08:00',
            'opcion_numero' => 1,
            'es_alternativa' => false
        ]);

        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'varios',
            'calorias_por_100g' => 300,
            'proteinas_por_100g' => 15,
            'carbohidratos_por_100g' => 40,
            'grasas_por_100g' => 8,
            'fibra_por_100g' => 5,
            'disponible' => true
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 100]);

        // Autenticar como nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Hacer petición
        $response = $this->getJson("/api/analisis-nutricional/plan/{$this->plan->id_plan}/resumen");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'calorias_promedio',
                        'distribucion_macronutrientes',
                        'variabilidad',
                        'dias_analizados'
                    ]
                ]);

        $data = $response->json('data');
        
        // Verificar que el resumen tiene los datos básicos
        $this->assertIsNumeric($data['calorias_promedio']);
        $this->assertArrayHasKey('proteinas', $data['distribucion_macronutrientes']);
        $this->assertArrayHasKey('carbohidratos', $data['distribucion_macronutrientes']);
        $this->assertArrayHasKey('grasas', $data['distribucion_macronutrientes']);
    }

    /** @test */
    public function test_no_puede_analizar_plan_de_otro_nutricionista()
    {
        // Crear otro nutricionista
        $otroUser = User::factory()->create([
            'email' => 'otro@test.com',
            'role' => 'nutricionista'
        ]);

        $otroNutricionista = Nutricionista::create([
            'user_id' => $otroUser->id,
            'nombre' => 'Otro',
            'apellido' => 'Nutricionista',
            'email' => 'otro@test.com',
            'especialidad' => 'Nutrición',
            'telefono' => '1111111111'
        ]);

        // Autenticar como el otro nutricionista
        $this->actingAs($otroNutricionista->user, 'sanctum');

        // Intentar acceder al plan del primer nutricionista
        $response = $this->getJson("/api/analisis-nutricional/plan/{$this->plan->id_plan}");

        $response->assertStatus(404);
    }
}
