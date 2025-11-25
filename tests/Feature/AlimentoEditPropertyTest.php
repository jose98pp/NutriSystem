<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Alimento;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de property-based testing para edición de alimentos (round trip)
 * Feature: mejoras-sistema-core, Property 10
 * Validates: Requirements 3.3
 */
class AlimentoEditPropertyTest extends TestCase
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
    public function property_round_trip_edicion_campos_basicos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear alimento inicial
        $alimentoOriginal = Alimento::create([
            'nombre' => 'Manzana',
            'categoria' => 'fruta',
            'descripcion' => 'Fruta roja',
            'calorias_por_100g' => 52,
            'proteinas_por_100g' => 0.3,
            'carbohidratos_por_100g' => 14,
            'grasas_por_100g' => 0.2,
            'disponible' => true
        ]);

        // Datos para actualizar
        $datosActualizados = [
            'nombre' => 'Manzana Verde',
            'categoria' => 'fruta',
            'descripcion' => 'Fruta verde ácida',
            'calorias_por_100g' => 58,
            'proteinas_por_100g' => 0.4,
            'carbohidratos_por_100g' => 15,
            'grasas_por_100g' => 0.3,
            'disponible' => true
        ];

        // Actualizar alimento
        $response = $this->putJson("/api/alimentos/{$alimentoOriginal->id_alimento}", $datosActualizados);
        $response->assertStatus(200);

        // Obtener alimento actualizado
        $getResponse = $this->getJson("/api/alimentos/{$alimentoOriginal->id_alimento}");
        $getResponse->assertStatus(200);

        // Verificar round trip: los datos actualizados deben coincidir
        $alimentoRecuperado = $getResponse->json('data');
        $this->assertEquals($datosActualizados['nombre'], $alimentoRecuperado['nombre']);
        $this->assertEquals($datosActualizados['categoria'], $alimentoRecuperado['categoria']);
        $this->assertEquals($datosActualizados['descripcion'], $alimentoRecuperado['descripcion']);
        $this->assertEquals($datosActualizados['calorias_por_100g'], $alimentoRecuperado['calorias_por_100g']);
        $this->assertEquals($datosActualizados['proteinas_por_100g'], $alimentoRecuperado['proteinas_por_100g']);
        $this->assertEquals($datosActualizados['carbohidratos_por_100g'], $alimentoRecuperado['carbohidratos_por_100g']);
        $this->assertEquals($datosActualizados['grasas_por_100g'], $alimentoRecuperado['grasas_por_100g']);
    }

    /** @test */
    public function property_round_trip_edicion_macronutrientes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Pollo',
            'categoria' => 'proteina',
            'calorias_por_100g' => 165,
            'proteinas_por_100g' => 31,
            'carbohidratos_por_100g' => 0,
            'grasas_por_100g' => 3.6
        ]);

        // Actualizar solo macronutrientes
        $nuevosValores = [
            'nombre' => 'Pollo',
            'categoria' => 'proteina',
            'calorias_por_100g' => 170,
            'proteinas_por_100g' => 32,
            'carbohidratos_por_100g' => 0.5,
            'grasas_por_100g' => 4.0
        ];

        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", $nuevosValores);
        $response->assertStatus(200);

        // Verificar round trip
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $alimentoRecuperado = $getResponse->json('data');
        
        $this->assertEquals($nuevosValores['calorias_por_100g'], $alimentoRecuperado['calorias_por_100g']);
        $this->assertEquals($nuevosValores['proteinas_por_100g'], $alimentoRecuperado['proteinas_por_100g']);
        $this->assertEquals($nuevosValores['carbohidratos_por_100g'], $alimentoRecuperado['carbohidratos_por_100g']);
        $this->assertEquals($nuevosValores['grasas_por_100g'], $alimentoRecuperado['grasas_por_100g']);
    }

    /** @test */
    public function property_round_trip_edicion_micronutrientes()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Naranja',
            'categoria' => 'fruta',
            'calorias_por_100g' => 47,
            'proteinas_por_100g' => 0.9,
            'carbohidratos_por_100g' => 12,
            'grasas_por_100g' => 0.1,
            'fibra_por_100g' => 2.4,
            'vitamina_c_por_100g' => 53
        ]);

        // Actualizar micronutrientes
        $nuevosValores = [
            'nombre' => 'Naranja',
            'categoria' => 'fruta',
            'calorias_por_100g' => 47,
            'proteinas_por_100g' => 0.9,
            'carbohidratos_por_100g' => 12,
            'grasas_por_100g' => 0.1,
            'fibra_por_100g' => 2.8,
            'azucares_por_100g' => 9.0,
            'sodio_por_100g' => 0.0,
            'potasio_por_100g' => 181,
            'calcio_por_100g' => 40,
            'hierro_por_100g' => 0.1,
            'vitamina_a_por_100g' => 225,
            'vitamina_c_por_100g' => 60
        ];

        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", $nuevosValores);
        $response->assertStatus(200);

        // Verificar round trip
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $alimentoRecuperado = $getResponse->json('data');
        
        $this->assertEquals($nuevosValores['fibra_por_100g'], $alimentoRecuperado['fibra_por_100g']);
        $this->assertEquals($nuevosValores['azucares_por_100g'], $alimentoRecuperado['azucares_por_100g']);
        $this->assertEquals($nuevosValores['potasio_por_100g'], $alimentoRecuperado['potasio_por_100g']);
        $this->assertEquals($nuevosValores['vitamina_c_por_100g'], $alimentoRecuperado['vitamina_c_por_100g']);
    }

    /** @test */
    public function property_round_trip_cambio_disponibilidad()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'otro',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5,
            'disponible' => true
        ]);

        // Cambiar disponibilidad a false
        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Alimento Test',
            'categoria' => 'otro',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5,
            'disponible' => false
        ]);
        $response->assertStatus(200);

        // Verificar cambio
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $this->assertFalse($getResponse->json('data.disponible'));

        // Cambiar de vuelta a true
        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Alimento Test',
            'categoria' => 'otro',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5,
            'disponible' => true
        ]);
        $response->assertStatus(200);

        // Verificar round trip completo
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $this->assertTrue($getResponse->json('data.disponible'));
    }

    /** @test */
    public function property_round_trip_cambio_categoria()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $categorias = ['fruta', 'verdura', 'proteina', 'cereal', 'lacteo', 'grasa', 'otro'];

        $alimento = Alimento::create([
            'nombre' => 'Alimento Cambiante',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Probar cambio a cada categoría
        foreach ($categorias as $categoria) {
            $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
                'nombre' => 'Alimento Cambiante',
                'categoria' => $categoria,
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ]);
            $response->assertStatus(200);

            // Verificar round trip
            $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
            $this->assertEquals($categoria, $getResponse->json('data.categoria'));
        }
    }

    /** @test */
    public function property_round_trip_edicion_restricciones()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Leche',
            'categoria' => 'lacteo',
            'calorias_por_100g' => 61,
            'proteinas_por_100g' => 3.2,
            'carbohidratos_por_100g' => 4.8,
            'grasas_por_100g' => 3.3,
            'restricciones' => null
        ]);

        // Agregar restricciones
        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Leche',
            'categoria' => 'lacteo',
            'calorias_por_100g' => 61,
            'proteinas_por_100g' => 3.2,
            'carbohidratos_por_100g' => 4.8,
            'grasas_por_100g' => 3.3,
            'restricciones' => 'lactosa'
        ]);
        $response->assertStatus(200);

        // Verificar
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $this->assertEquals('lactosa', $getResponse->json('data.restricciones'));

        // Actualizar restricciones
        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Leche',
            'categoria' => 'lacteo',
            'calorias_por_100g' => 61,
            'proteinas_por_100g' => 3.2,
            'carbohidratos_por_100g' => 4.8,
            'grasas_por_100g' => 3.3,
            'restricciones' => 'lactosa, caseína'
        ]);
        $response->assertStatus(200);

        // Verificar round trip
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $this->assertEquals('lactosa, caseína', $getResponse->json('data.restricciones'));
    }

    /** @test */
    public function property_round_trip_edicion_parcial()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Banana',
            'categoria' => 'fruta',
            'descripcion' => 'Fruta amarilla',
            'calorias_por_100g' => 89,
            'proteinas_por_100g' => 1.1,
            'carbohidratos_por_100g' => 23,
            'grasas_por_100g' => 0.3,
            'fibra_por_100g' => 2.6,
            'potasio_por_100g' => 358
        ]);

        // Actualizar solo algunos campos
        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Banana',
            'categoria' => 'fruta',
            'descripcion' => 'Fruta tropical amarilla rica en potasio',
            'calorias_por_100g' => 89,
            'proteinas_por_100g' => 1.1,
            'carbohidratos_por_100g' => 23,
            'grasas_por_100g' => 0.3
        ]);
        $response->assertStatus(200);

        // Verificar que los campos actualizados cambiaron
        $getResponse = $this->getJson("/api/alimentos/{$alimento->id_alimento}");
        $alimentoRecuperado = $getResponse->json('data');
        
        $this->assertEquals('Fruta tropical amarilla rica en potasio', $alimentoRecuperado['descripcion']);
        
        // Verificar que los campos no enviados se mantienen
        $this->assertEquals(2.6, $alimentoRecuperado['fibra_por_100g']);
        $this->assertEquals(358, $alimentoRecuperado['potasio_por_100g']);
    }

    /** @test */
    public function property_edicion_no_permite_nombre_duplicado()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear dos alimentos
        $alimento1 = Alimento::create([
            'nombre' => 'Alimento 1',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $alimento2 = Alimento::create([
            'nombre' => 'Alimento 2',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        // Intentar cambiar nombre de alimento2 al nombre de alimento1
        $response = $this->putJson("/api/alimentos/{$alimento2->id_alimento}", [
            'nombre' => 'Alimento 1', // Nombre duplicado
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nombre']);
    }

    /** @test */
    public function property_edicion_mantiene_mismo_id()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Alimento Original',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $idOriginal = $alimento->id_alimento;

        // Actualizar múltiples veces
        for ($i = 1; $i <= 5; $i++) {
            $response = $this->putJson("/api/alimentos/{$idOriginal}", [
                'nombre' => "Alimento Actualizado {$i}",
                'categoria' => 'fruta',
                'calorias_por_100g' => 100 + $i,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ]);
            $response->assertStatus(200);

            // Verificar que el ID no cambió
            $this->assertEquals($idOriginal, $response->json('data.id_alimento'));
        }

        // Verificar que solo existe un registro con ese ID
        $this->assertEquals(1, Alimento::where('id_alimento', $idOriginal)->count());
    }

    /** @test */
    public function property_edicion_actualiza_timestamps()
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

        $createdAt = $alimento->created_at;
        $updatedAt = $alimento->updated_at;

        // Esperar un momento
        sleep(1);

        // Actualizar
        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Alimento Test Actualizado',
            'categoria' => 'fruta',
            'calorias_por_100g' => 105,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);
        $response->assertStatus(200);

        // Verificar timestamps
        $alimentoActualizado = Alimento::find($alimento->id_alimento);
        $this->assertEquals($createdAt->timestamp, $alimentoActualizado->created_at->timestamp);
        $this->assertGreaterThan($updatedAt->timestamp, $alimentoActualizado->updated_at->timestamp);
    }

    /** @test */
    public function property_edicion_requiere_autenticacion()
    {
        // Sin autenticación
        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Alimento Test Actualizado',
            'categoria' => 'fruta',
            'calorias_por_100g' => 105,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response->assertStatus(401); // Unauthorized
    }

    /** @test */
    public function property_edicion_requiere_permisos_correctos()
    {
        // Crear usuario paciente (sin permisos)
        $pacienteUser = User::factory()->create(['role' => 'paciente']);
        $this->actingAs($pacienteUser, 'sanctum');

        $alimento = Alimento::create([
            'nombre' => 'Alimento Test',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response = $this->putJson("/api/alimentos/{$alimento->id_alimento}", [
            'nombre' => 'Alimento Test Actualizado',
            'categoria' => 'fruta',
            'calorias_por_100g' => 105,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ]);

        $response->assertStatus(403); // Forbidden
    }
}
