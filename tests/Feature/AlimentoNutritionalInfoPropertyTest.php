<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Alimento;
use App\Models\PlanAlimentacion;
use App\Models\DiaAlimentacion;
use App\Models\Comida;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de property-based testing para información nutricional completa
 * Feature: mejoras-sistema-core, Property 12
 * Validates: Requirements 3.5
 */
class AlimentoNutritionalInfoPropertyTest extends TestCase
{
    use RefreshDatabase;

    protected $nutricionista;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear nutricionista para autenticación
        $user = User::factory()->create(['role' => 'nutricionista']);
        $this->nutricionista = Nutricionista::create([
            'user_id' => $user->id,
            'nombre' => 'Dr. Test',
            'apellido' => 'Nutricionista',
            'email' => 'test@nutricionista.com',
            'especialidad' => 'Nutrición',
            'telefono' => '1234567890'
        ]);
    }

    /** @test */
    public function property_informacion_completa_incluye_todos_macronutrientes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento con todos los macronutrientes
        $alimento = Alimento::create([
            'nombre' => 'Alimento Completo',
            'categoria' => 'proteina',
            'descripcion' => 'Alimento con información completa',
            'calorias_por_100g' => 165,
            'proteinas_por_100g' => 31,
            'carbohidratos_por_100g' => 5,
            'grasas_por_100g' => 3.6
        ]);

        // Obtener información del alimento
        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar que incluye todos los macronutrientes
        $this->assertArrayHasKey('calorias_por_100g', $data);
        $this->assertArrayHasKey('proteinas_por_100g', $data);
        $this->assertArrayHasKey('carbohidratos_por_100g', $data);
        $this->assertArrayHasKey('grasas_por_100g', $data);

        // Verificar valores correctos
        $this->assertEquals(165, $data['calorias_por_100g']);
        $this->assertEquals(31, $data['proteinas_por_100g']);
        $this->assertEquals(5, $data['carbohidratos_por_100g']);
        $this->assertEquals(3.6, $data['grasas_por_100g']);
    }

    /** @test */
    public function property_informacion_completa_incluye_micronutrientes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento con micronutrientes
        $alimento = Alimento::create([
            'nombre' => 'Naranja',
            'categoria' => 'fruta',
            'calorias_por_100g' => 47,
            'proteinas_por_100g' => 0.9,
            'carbohidratos_por_100g' => 12,
            'grasas_por_100g' => 0.1,
            'fibra_por_100g' => 2.4,
            'azucares_por_100g' => 9.0,
            'sodio_por_100g' => 0.0,
            'potasio_por_100g' => 181,
            'calcio_por_100g' => 40,
            'hierro_por_100g' => 0.1,
            'vitamina_a_por_100g' => 225,
            'vitamina_c_por_100g' => 53
        ]);

        // Obtener información del alimento
        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar que incluye micronutrientes
        $this->assertArrayHasKey('fibra_por_100g', $data);
        $this->assertArrayHasKey('azucares_por_100g', $data);
        $this->assertArrayHasKey('sodio_por_100g', $data);
        $this->assertArrayHasKey('potasio_por_100g', $data);
        $this->assertArrayHasKey('calcio_por_100g', $data);
        $this->assertArrayHasKey('hierro_por_100g', $data);
        $this->assertArrayHasKey('vitamina_a_por_100g', $data);
        $this->assertArrayHasKey('vitamina_c_por_100g', $data);

        // Verificar valores correctos
        $this->assertEquals(2.4, $data['fibra_por_100g']);
        $this->assertEquals(53, $data['vitamina_c_por_100g']);
    }

    /** @test */
    public function property_informacion_incluye_datos_basicos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Manzana',
            'categoria' => 'fruta',
            'descripcion' => 'Fruta roja dulce',
            'calorias_por_100g' => 52,
            'proteinas_por_100g' => 0.3,
            'carbohidratos_por_100g' => 14,
            'grasas_por_100g' => 0.2,
            'disponible' => true,
            'restricciones' => 'ninguna'
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar datos básicos
        $this->assertArrayHasKey('id_alimento', $data);
        $this->assertArrayHasKey('nombre', $data);
        $this->assertArrayHasKey('categoria', $data);
        $this->assertArrayHasKey('descripcion', $data);
        $this->assertArrayHasKey('disponible', $data);
        $this->assertArrayHasKey('restricciones', $data);

        // Verificar valores
        $this->assertEquals('Manzana', $data['nombre']);
        $this->assertEquals('fruta', $data['categoria']);
        $this->assertEquals('Fruta roja dulce', $data['descripcion']);
        $this->assertTrue($data['disponible']);
    }

    /** @test */
    public function property_informacion_incluye_uso_en_planes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Arroz',
            'categoria' => 'cereal',
            'calorias_por_100g' => 130,
            'proteinas_por_100g' => 2.7,
            'carbohidratos_por_100g' => 28,
            'grasas_por_100g' => 0.3
        ]);

        // Crear plan activo con el alimento
        $plan = PlanAlimentacion::create([
            'nombre' => 'Plan Test',
            'descripcion' => 'Plan de prueba',
            'nutricionista_id' => $this->nutricionista->id_nutricionista,
            'activo' => true
        ]);

        $dia = DiaAlimentacion::create([
            'plan_id' => $plan->id_plan,
            'numero_dia' => 1,
            'nombre' => 'Día 1'
        ]);

        $comida = Comida::create([
            'dia_id' => $dia->id_dia,
            'tipo_comida' => 'almuerzo',
            'opcion_numero' => 1,
            'es_alternativa' => false,
            'nombre_opcion' => 'Principal'
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 200]);

        // Obtener información del alimento
        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar que incluye información de uso
        $this->assertArrayHasKey('usage_info', $data);
        $this->assertArrayHasKey('in_active_plans', $data['usage_info']);
        $this->assertArrayHasKey('active_plans_count', $data['usage_info']);
        $this->assertTrue($data['usage_info']['in_active_plans']);
        $this->assertGreaterThan(0, $data['usage_info']['active_plans_count']);
    }

    /** @test */
    public function property_informacion_incluye_lista_de_planes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Pollo',
            'categoria' => 'proteina',
            'calorias_por_100g' => 165,
            'proteinas_por_100g' => 31,
            'carbohidratos_por_100g' => 0,
            'grasas_por_100g' => 3.6
        ]);

        // Crear múltiples planes con el alimento
        $planesCreados = [];
        for ($i = 1; $i <= 3; $i++) {
            $plan = PlanAlimentacion::create([
                'nombre' => "Plan Test {$i}",
                'descripcion' => "Plan de prueba {$i}",
                'nutricionista_id' => $this->nutricionista->id_nutricionista,
                'activo' => true
            ]);

            $dia = DiaAlimentacion::create([
                'plan_id' => $plan->id_plan,
                'numero_dia' => 1,
                'nombre' => 'Día 1'
            ]);

            $comida = Comida::create([
                'dia_id' => $dia->id_dia,
                'tipo_comida' => 'almuerzo',
                'opcion_numero' => 1,
                'es_alternativa' => false,
                'nombre_opcion' => 'Principal'
            ]);

            $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 200]);
            $planesCreados[] = $plan;
        }

        // Obtener información del alimento
        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar que incluye lista de planes
        $this->assertArrayHasKey('usage_info', $data);
        $this->assertArrayHasKey('active_plans', $data['usage_info']);
        $this->assertIsArray($data['usage_info']['active_plans']);
        $this->assertCount(3, $data['usage_info']['active_plans']);

        // Verificar que cada plan tiene información básica
        foreach ($data['usage_info']['active_plans'] as $planInfo) {
            $this->assertArrayHasKey('id_plan', $planInfo);
            $this->assertArrayHasKey('nombre', $planInfo);
        }
    }

    /** @test */
    public function property_informacion_incluye_timestamps()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar timestamps
        $this->assertArrayHasKey('created_at', $data);
        $this->assertArrayHasKey('updated_at', $data);
        $this->assertNotNull($data['created_at']);
        $this->assertNotNull($data['updated_at']);
    }

    /** @test */
    public function property_informacion_calcula_densidad_nutricional()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento con alta densidad nutricional
        $alimento = Alimento::create([
            'nombre' => 'Espinaca',
            'categoria' => 'verdura',
            'calorias_por_100g' => 23,
            'proteinas_por_100g' => 2.9,
            'carbohidratos_por_100g' => 3.6,
            'grasas_por_100g' => 0.4,
            'fibra_por_100g' => 2.2,
            'vitamina_a_por_100g' => 469,
            'vitamina_c_por_100g' => 28,
            'hierro_por_100g' => 2.7
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar que incluye cálculo de densidad nutricional
        $this->assertArrayHasKey('nutritional_density', $data);
        $this->assertIsNumeric($data['nutritional_density']);
        $this->assertGreaterThan(0, $data['nutritional_density']);
    }

    /** @test */
    public function property_informacion_incluye_clasificacion_saludabilidad()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Brócoli',
            'categoria' => 'verdura',
            'calorias_por_100g' => 34,
            'proteinas_por_100g' => 2.8,
            'carbohidratos_por_100g' => 7,
            'grasas_por_100g' => 0.4,
            'fibra_por_100g' => 2.6
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar clasificación de saludabilidad
        $this->assertArrayHasKey('health_classification', $data);
        $this->assertContains($data['health_classification'], ['muy_saludable', 'saludable', 'moderado', 'poco_saludable']);
    }

    /** @test */
    public function property_informacion_incluye_porcentaje_macronutrientes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Alimento Balanceado',
            'categoria' => 'otro',
            'calorias_por_100g' => 200,
            'proteinas_por_100g' => 20, // 80 cal = 40%
            'carbohidratos_por_100g' => 20, // 80 cal = 40%
            'grasas_por_100g' => 4.4 // ~40 cal = 20%
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar porcentajes de macronutrientes
        $this->assertArrayHasKey('macronutrient_percentages', $data);
        $this->assertArrayHasKey('protein_percentage', $data['macronutrient_percentages']);
        $this->assertArrayHasKey('carb_percentage', $data['macronutrient_percentages']);
        $this->assertArrayHasKey('fat_percentage', $data['macronutrient_percentages']);

        // Verificar que los porcentajes suman aproximadamente 100%
        $total = $data['macronutrient_percentages']['protein_percentage'] +
                 $data['macronutrient_percentages']['carb_percentage'] +
                 $data['macronutrient_percentages']['fat_percentage'];
        
        $this->assertGreaterThanOrEqual(95, $total);
        $this->assertLessThanOrEqual(105, $total);
    }

    /** @test */
    public function property_informacion_incluye_restricciones_dieteticas()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Pan Integral',
            'categoria' => 'cereal',
            'calorias_por_100g' => 247,
            'proteinas_por_100g' => 13,
            'carbohidratos_por_100g' => 41,
            'grasas_por_100g' => 3.4,
            'restricciones' => 'gluten'
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar restricciones
        $this->assertArrayHasKey('restricciones', $data);
        $this->assertEquals('gluten', $data['restricciones']);

        // Verificar que incluye array de restricciones parseadas
        $this->assertArrayHasKey('dietary_restrictions', $data);
        $this->assertIsArray($data['dietary_restrictions']);
        $this->assertContains('gluten', $data['dietary_restrictions']);
    }

    /** @test */
    public function property_informacion_vacia_para_micronutrientes_opcionales()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento solo con macronutrientes
        $alimento = Alimento::create([
            'nombre' => 'Alimento Básico',
            'categoria' => 'otro',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        $data = $response->json('data');

        // Verificar que micronutrientes opcionales están presentes pero pueden ser null
        $this->assertArrayHasKey('fibra_por_100g', $data);
        $this->assertArrayHasKey('vitamina_c_por_100g', $data);
        
        // Los valores pueden ser null o 0
        $this->assertTrue(
            is_null($data['fibra_por_100g']) || 
            $data['fibra_por_100g'] === 0 ||
            is_numeric($data['fibra_por_100g'])
        );
    }

    /** @test */
    public function property_informacion_consistente_en_multiples_consultas()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Alimento Consistente',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Realizar múltiples consultas
        $responses = [];
        for ($i = 0; $i < 5; $i++) {
            $response = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
            $response->assertStatus(200);
            $responses[] = $response->json('data');
        }

        // Verificar que todos los valores nutricionales son consistentes
        $firstResponse = $responses[0];
        foreach ($responses as $response) {
            $this->assertEquals($firstResponse['calorias_por_100g'], $response['calorias_por_100g']);
            $this->assertEquals($firstResponse['proteinas_por_100g'], $response['proteinas_por_100g']);
            $this->assertEquals($firstResponse['carbohidratos_por_100g'], $response['carbohidratos_por_100g']);
            $this->assertEquals($firstResponse['grasas_por_100g'], $response['grasas_por_100g']);
        }
    }

    /** @test */
    public function property_informacion_accesible_para_todos_los_roles()
    {
        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Alimento Público',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Probar con nutricionista
        $this->actingAs($this->nutricionista->user, 'sanctum');
        $response1 = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response1->assertStatus(200);

        // Probar con paciente
        $pacienteUser = User::factory()->create(['role' => 'paciente']);
        $this->actingAs($pacienteUser, 'sanctum');
        $response2 = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response2->assertStatus(200);

        // Probar con admin
        $adminUser = User::factory()->create(['role' => 'admin']);
        $this->actingAs($adminUser, 'sanctum');
        $response3 = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $response3->assertStatus(200);

        // Verificar que todos obtienen la misma información nutricional
        $data1 = $response1->json('data');
        $data2 = $response2->json('data');
        $data3 = $response3->json('data');

        $this->assertEquals($data1['calorias_por_100g'], $data2['calorias_por_100g']);
        $this->assertEquals($data1['calorias_por_100g'], $data3['calorias_por_100g']);
    }
}
