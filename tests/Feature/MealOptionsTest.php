<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Paciente;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Services\MealOptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

/**
 * Feature: mejoras-sistema-core, Multiple meal options functionality
 * Validates: Requirements 2.1, 2.2, 2.3
 */
class MealOptionsTest extends TestCase
{
    use RefreshDatabase;

    protected $nutricionista;
    protected $paciente;
    protected $plan;
    protected $dia;
    protected $mealOptionService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear nutricionista
        $user = User::factory()->create([
            'role' => 'nutricionista',
            'email_verified_at' => now()
        ]);
        
        $this->nutricionista = Nutricionista::create([
            'user_id' => $user->id,
            'nombre' => $user->name,
            'apellido' => 'Test',
            'email' => $user->email,
            'celular' => '1234567890'
        ]);
        
        // Crear paciente
        $userPaciente = User::factory()->create([
            'role' => 'paciente',
            'email_verified_at' => now()
        ]);
        
        $this->paciente = Paciente::create([
            'user_id' => $userPaciente->id,
            'nombre' => $userPaciente->name,
            'apellido' => 'Paciente Test',
            'email' => $userPaciente->email,
            'celular' => '0987654321',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M'
        ]);
        
        // Crear plan de alimentación
        $this->plan = PlanAlimentacion::create([
            'nombre' => 'Plan Test',
            'nombre_plan' => 'Plan Test',
            'descripcion' => 'Plan de prueba',
            'id_nutricionista' => $this->nutricionista->id_nutricionista,
            'id_paciente' => $this->paciente->id_paciente,
            'objetivo' => 'Pérdida de peso',
            'fecha_inicio' => now()->format('Y-m-d'),
            'fecha_fin' => now()->addDays(7)->format('Y-m-d'),
            'estado' => 'activo'
        ]);
        
        // Crear día
        $this->dia = PlanDia::create([
            'id_plan' => $this->plan->id_plan,
            'dia_numero' => 1,
            'dia_index' => 0,
            'fecha' => now()->format('Y-m-d')
        ]);
        
        $this->mealOptionService = new MealOptionService();
        
        Auth::login($user);
    }

    /**
     * Test: Agregar primera opción de comida
     */
    public function test_can_add_first_meal_option()
    {
        $response = $this->postJson("/api/planes/{$this->plan->id_plan}/dias/{$this->dia->id_dia}/opciones", [
            'tipo_comida' => 'DESAYUNO',
            'nombre' => 'Desayuno Opción 1',
            'descripcion' => 'Primera opción de desayuno',
            'hora_recomendada' => '08:00'
        ]);

        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'message' => 'Opción de comida agregada exitosamente'
                ]);

        $this->assertDatabaseHas('comidas', [
            'id_dia' => $this->dia->id_dia,
            'tipo_comida' => 'DESAYUNO',
            'nombre' => 'Desayuno Opción 1',
            'opcion_numero' => 1,
            'es_alternativa' => false
        ]);
    }

    /**
     * Test: Agregar segunda opción de comida
     */
    public function test_can_add_second_meal_option()
    {
        // Crear primera opción
        $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'DESAYUNO', [
            'nombre' => 'Desayuno Opción 1',
            'descripcion' => 'Primera opción'
        ]);

        // Agregar segunda opción
        $response = $this->postJson("/api/planes/{$this->plan->id_plan}/dias/{$this->dia->id_dia}/opciones", [
            'tipo_comida' => 'DESAYUNO',
            'nombre' => 'Desayuno Opción 2',
            'descripcion' => 'Segunda opción de desayuno',
            'nombre_opcion' => 'Alternativa Saludable'
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comidas', [
            'id_dia' => $this->dia->id_dia,
            'tipo_comida' => 'DESAYUNO',
            'nombre' => 'Desayuno Opción 2',
            'opcion_numero' => 2,
            'es_alternativa' => true,
            'nombre_opcion' => 'Alternativa Saludable'
        ]);
    }

    /**
     * Test: No se pueden agregar más de 2 opciones por turno
     */
    public function test_cannot_add_more_than_two_options_per_meal()
    {
        // Crear dos opciones
        $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'ALMUERZO', [
            'nombre' => 'Almuerzo Opción 1'
        ]);
        
        $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'ALMUERZO', [
            'nombre' => 'Almuerzo Opción 2'
        ]);

        // Intentar agregar tercera opción
        $response = $this->postJson("/api/planes/{$this->plan->id_plan}/dias/{$this->dia->id_dia}/opciones", [
            'tipo_comida' => 'ALMUERZO',
            'nombre' => 'Almuerzo Opción 3'
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'No se pueden agregar más de 2 opciones por turno de comida'
                ]);
    }

    /**
     * Test: Obtener opciones de un turno específico
     */
    public function test_can_get_meal_options()
    {
        // Crear opciones
        $opcion1 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'CENA', [
            'nombre' => 'Cena Opción 1'
        ]);
        
        $opcion2 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'CENA', [
            'nombre' => 'Cena Opción 2'
        ]);

        $response = $this->getJson("/api/planes/{$this->plan->id_plan}/dias/{$this->dia->id_dia}/opciones/CENA");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true
                ])
                ->assertJsonCount(2, 'data');

        $data = $response->json('data');
        $this->assertEquals('Cena Opción 1', $data[0]['nombre']);
        $this->assertEquals('Cena Opción 2', $data[1]['nombre']);
        $this->assertEquals(1, $data[0]['opcion_numero']);
        $this->assertEquals(2, $data[1]['opcion_numero']);
    }

    /**
     * Test: Eliminar opción y reordenar automáticamente
     */
    public function test_can_delete_option_and_reorder()
    {
        // Crear dos opciones
        $opcion1 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'COLACION_MATUTINA', [
            'nombre' => 'Colación Opción 1'
        ]);
        
        $opcion2 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'COLACION_MATUTINA', [
            'nombre' => 'Colación Opción 2'
        ]);

        // Eliminar primera opción
        $response = $this->deleteJson("/api/planes/{$this->plan->id_plan}/dias/{$this->dia->id_dia}/opciones/{$opcion1->id_comida}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Opción de comida eliminada exitosamente'
                ]);

        // Verificar que la segunda opción ahora es la primera
        $this->assertDatabaseMissing('comidas', [
            'id_comida' => $opcion1->id_comida
        ]);

        $opcionRestante = Comida::find($opcion2->id_comida);
        $this->assertEquals(1, $opcionRestante->opcion_numero);
        $this->assertFalse($opcionRestante->es_alternativa);
    }

    /**
     * Test: Reordenar opciones
     */
    public function test_can_reorder_options()
    {
        // Crear dos opciones
        $opcion1 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'COLACION_VESPERTINA', [
            'nombre' => 'Colación Opción 1'
        ]);
        
        $opcion2 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'COLACION_VESPERTINA', [
            'nombre' => 'Colación Opción 2'
        ]);

        // Reordenar (intercambiar posiciones)
        $response = $this->putJson("/api/planes/{$this->plan->id_plan}/dias/{$this->dia->id_dia}/opciones/COLACION_VESPERTINA/reordenar", [
            'orden_ids' => [$opcion2->id_comida, $opcion1->id_comida]
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Opciones reordenadas exitosamente'
                ]);

        // Verificar nuevo orden
        $opcion1->refresh();
        $opcion2->refresh();
        
        $this->assertEquals(2, $opcion1->opcion_numero);
        $this->assertEquals(1, $opcion2->opcion_numero);
        $this->assertTrue($opcion1->es_alternativa);
        $this->assertFalse($opcion2->es_alternativa);
    }

    /**
     * Test: Etiquetado automático de opciones
     */
    public function test_automatic_option_labeling()
    {
        // Crear primera opción (sin etiqueta personalizada)
        $opcion1 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'DESAYUNO', [
            'nombre' => 'Desayuno Base'
        ]);
        
        // Crear segunda opción (sin etiqueta personalizada)
        $opcion2 = $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'DESAYUNO', [
            'nombre' => 'Desayuno Alternativo'
        ]);

        $this->assertNull($opcion1->nombre_opcion);
        $this->assertEquals('Opción 2', $opcion2->nombre_opcion);
    }

    /**
     * Test: Validación de límite en MealOptionService
     */
    public function test_meal_option_service_validates_limit()
    {
        // Crear dos opciones
        $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'DESAYUNO', [
            'nombre' => 'Opción 1'
        ]);
        
        $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'DESAYUNO', [
            'nombre' => 'Opción 2'
        ]);

        // Intentar agregar tercera opción debe lanzar excepción
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No se pueden agregar más de 2 opciones por turno de comida');
        
        $this->mealOptionService->agregarOpcionComida($this->dia->id_dia, 'DESAYUNO', [
            'nombre' => 'Opción 3'
        ]);
    }
}
