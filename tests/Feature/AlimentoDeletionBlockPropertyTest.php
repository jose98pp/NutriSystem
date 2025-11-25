<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Paciente;
use App\Models\Alimento;
use App\Models\PlanAlimentacion;
use App\Models\DiaAlimentacion;
use App\Models\Comida;
use App\Models\Receta;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de property-based testing para bloqueo de eliminación de alimentos en uso
 * Feature: mejoras-sistema-core, Property 11
 * Validates: Requirements 3.4
 */
class AlimentoDeletionBlockPropertyTest extends TestCase
{
    use RefreshDatabase;

    protected $nutricionista;
    protected $paciente;

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

        // Crear paciente
        $pacienteUser = User::factory()->create(['role' => 'paciente']);
        $this->paciente = Paciente::create([
            'user_id' => $pacienteUser->id,
            'nombre' => 'Paciente',
            'apellido' => 'Test',
            'email' => 'paciente@test.com',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'masculino',
            'telefono' => '1234567890'
        ]);
    }

    /** @test */
    public function property_alimento_sin_uso_puede_eliminarse()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento sin uso
        $alimento = Alimento::create([
            'nombre' => 'Alimento Sin Uso',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Intentar eliminar
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        // Verificar que se eliminó
        $this->assertDatabaseMissing('alimentos', ['id_alimento' => $alimento->id_alimento]);
    }

    /** @test */
    public function property_alimento_en_plan_activo_no_puede_eliminarse()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Manzana',
            'categoria' => 'fruta',
            'calorias_por_100g' => 52,
            'proteinas_por_100g' => 0.3,
            'carbohidratos_por_100g' => 14,
            'grasas_por_100g' => 0.2
        ]);

        // Crear plan activo
        $plan = PlanAlimentacion::create([
            'nombre' => 'Plan Test',
            'descripcion' => 'Plan de prueba',
            'nutricionista_id' => $this->nutricionista->id_nutricionista,
            'activo' => true
        ]);

        // Crear día y comida con el alimento
        $dia = DiaAlimentacion::create([
            'plan_id' => $plan->id_plan,
            'numero_dia' => 1,
            'nombre' => 'Día 1'
        ]);

        $comida = Comida::create([
            'dia_id' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'opcion_numero' => 1,
            'es_alternativa' => false,
            'nombre_opcion' => 'Principal'
        ]);

        // Asociar alimento a la comida
        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 150]);

        // Intentar eliminar alimento
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'No se puede eliminar el alimento porque está siendo usado en planes activos']);

        // Verificar que NO se eliminó
        $this->assertDatabaseHas('alimentos', ['id_alimento' => $alimento->id_alimento]);
    }

    /** @test */
    public function property_alimento_en_plan_inactivo_puede_eliminarse()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Pera',
            'categoria' => 'fruta',
            'calorias_por_100g' => 57,
            'proteinas_por_100g' => 0.4,
            'carbohidratos_por_100g' => 15,
            'grasas_por_100g' => 0.1
        ]);

        // Crear plan INACTIVO
        $plan = PlanAlimentacion::create([
            'nombre' => 'Plan Inactivo',
            'descripcion' => 'Plan de prueba inactivo',
            'nutricionista_id' => $this->nutricionista->id_nutricionista,
            'activo' => false
        ]);

        // Crear día y comida con el alimento
        $dia = DiaAlimentacion::create([
            'plan_id' => $plan->id_plan,
            'numero_dia' => 1,
            'nombre' => 'Día 1'
        ]);

        $comida = Comida::create([
            'dia_id' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'opcion_numero' => 1,
            'es_alternativa' => false,
            'nombre_opcion' => 'Principal'
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 150]);

        // Intentar eliminar alimento (debe permitirse porque el plan está inactivo)
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        // Verificar que se eliminó
        $this->assertDatabaseMissing('alimentos', ['id_alimento' => $alimento->id_alimento]);
    }

    /** @test */
    public function property_alimento_en_receta_no_puede_eliminarse()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Harina',
            'categoria' => 'cereal',
            'calorias_por_100g' => 364,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 76,
            'grasas_por_100g' => 1
        ]);

        // Crear receta con el alimento
        $receta = Receta::create([
            'nombre' => 'Pan Casero',
            'descripcion' => 'Receta de pan',
            'nutricionista_id' => $this->nutricionista->id_nutricionista,
            'instrucciones_preparacion' => 'Mezclar y hornear',
            'tiempo_preparacion_minutos' => 60,
            'dificultad' => 'media'
        ]);

        $receta->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 500]);

        // Intentar eliminar alimento
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'No se puede eliminar el alimento porque está siendo usado en recetas']);

        // Verificar que NO se eliminó
        $this->assertDatabaseHas('alimentos', ['id_alimento' => $alimento->id_alimento]);
    }

    /** @test */
    public function property_alimento_en_multiples_planes_activos_no_puede_eliminarse()
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

        // Crear múltiples planes activos con el alimento
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
        }

        // Intentar eliminar alimento
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(422);
        
        // Verificar que el mensaje indica múltiples usos
        $responseData = $response->json();
        $this->assertStringContainsString('planes activos', $responseData['message']);

        // Verificar que NO se eliminó
        $this->assertDatabaseHas('alimentos', ['id_alimento' => $alimento->id_alimento]);
    }

    /** @test */
    public function property_informacion_detallada_de_uso_en_respuesta()
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

        // Crear plan activo
        $plan = PlanAlimentacion::create([
            'nombre' => 'Plan Proteico',
            'descripcion' => 'Plan alto en proteínas',
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

        // Intentar eliminar y verificar información detallada
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(422);
        
        $responseData = $response->json();
        $this->assertArrayHasKey('usage_details', $responseData);
        $this->assertArrayHasKey('active_plans', $responseData['usage_details']);
        $this->assertGreaterThan(0, count($responseData['usage_details']['active_plans']));
    }

    /** @test */
    public function property_eliminacion_en_cascada_de_relaciones()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento sin uso en planes activos
        $alimento = Alimento::create([
            'nombre' => 'Alimento Temporal',
            'categoria' => 'otro',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Crear plan inactivo con el alimento
        $plan = PlanAlimentacion::create([
            'nombre' => 'Plan Temporal',
            'descripcion' => 'Plan temporal',
            'nutricionista_id' => $this->nutricionista->id_nutricionista,
            'activo' => false
        ]);

        $dia = DiaAlimentacion::create([
            'plan_id' => $plan->id_plan,
            'numero_dia' => 1,
            'nombre' => 'Día 1'
        ]);

        $comida = Comida::create([
            'dia_id' => $dia->id_dia,
            'tipo_comida' => 'desayuno',
            'opcion_numero' => 1,
            'es_alternativa' => false,
            'nombre_opcion' => 'Principal'
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 150]);

        // Eliminar alimento
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(200);

        // Verificar que se eliminó el alimento
        $this->assertDatabaseMissing('alimentos', ['id_alimento' => $alimento->id_alimento]);

        // Verificar que se eliminó la relación en la tabla pivot
        $this->assertDatabaseMissing('comida_alimentos', [
            'alimento_id' => $alimento->id_alimento,
            'comida_id' => $comida->id_comida
        ]);
    }

    /** @test */
    public function property_soft_delete_preserva_datos_historicos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Alimento Histórico',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $alimentoId = $alimento->id_alimento;

        // Eliminar alimento
        $response = $this->deleteJson("/api/alimentos/{$alimentoId}");
        $response->assertStatus(200);

        // Verificar que está marcado como eliminado (soft delete)
        $alimentoEliminado = Alimento::withTrashed()->find($alimentoId);
        $this->assertNotNull($alimentoEliminado);
        $this->assertNotNull($alimentoEliminado->deleted_at);

        // Verificar que no aparece en consultas normales
        $this->assertNull(Alimento::find($alimentoId));
    }

    /** @test */
    public function property_no_puede_eliminar_alimento_inexistente()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Intentar eliminar alimento que no existe
        $response = $this->deleteJson("/api/alimentos/99999");
        $response->assertStatus(404);
    }

    /** @test */
    public function property_eliminacion_requiere_autenticacion()
    {
        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Intentar eliminar sin autenticación
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(401); // Unauthorized
    }

    /** @test */
    public function property_eliminacion_requiere_permisos_correctos()
    {
        // Crear usuario paciente (sin permisos)
        $pacienteUser = User::factory()->create(['role' => 'paciente']);
        $this->actingAs($pacienteUser, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Intentar eliminar como paciente
        $response = $this->deleteJson("/api/alimentos/{$alimento->id_alimento}");
        $response->assertStatus(403); // Forbidden
    }

    /** @test */
    public function property_verificacion_uso_antes_de_eliminar()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento
        $alimento = Alimento::create([
            'nombre' => 'Alimento Verificación',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Verificar uso antes de eliminar (endpoint de verificación)
        $checkResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}/check-usage");
        $checkResponse->assertStatus(200);
        $checkResponse->assertJson([
            'can_delete' => true,
            'in_active_plans' => false,
            'in_recipes' => false
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
            'tipo_comida' => 'desayuno',
            'opcion_numero' => 1,
            'es_alternativa' => false,
            'nombre_opcion' => 'Principal'
        ]);

        $comida->alimentos()->attach($alimento->id_alimento, ['cantidad_gramos' => 150]);

        // Verificar uso nuevamente
        $checkResponse2 = $this->getJson("/api/alimentos/{$alimento->id_alimento}/check-usage");
        $checkResponse2->assertStatus(200);
        $checkResponse2->assertJson([
            'can_delete' => false,
            'in_active_plans' => true
        ]);
    }
}
