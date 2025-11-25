<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Nutricionista;
use App\Models\Alimento;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de property-based testing para validación de campos requeridos de alimentos
 * Feature: mejoras-sistema-core, Property 9
 * Validates: Requirements 3.2
 */
class AlimentoValidationPropertyTest extends TestCase
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
    public function property_campos_requeridos_nombre_categoria_calorias()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $camposRequeridos = ['nombre', 'categoria', 'calorias_por_100g'];
        
        foreach ($camposRequeridos as $campo) {
            $data = [
                'nombre' => 'Alimento Test',
                'categoria' => 'fruta',
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ];
            
            // Remover el campo requerido
            unset($data[$campo]);
            
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(422);
            $response->assertJsonValidationErrors([$campo]);
        }
    }

    /** @test */
    public function property_macronutrientes_requeridos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $macronutrientes = ['proteinas_por_100g', 'carbohidratos_por_100g', 'grasas_por_100g'];
        
        foreach ($macronutrientes as $macro) {
            $data = [
                'nombre' => 'Alimento Test',
                'categoria' => 'fruta',
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ];
            
            unset($data[$macro]);
            
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(422);
            $response->assertJsonValidationErrors([$macro]);
        }
    }

    /** @test */
    public function property_valores_numericos_no_negativos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $camposNumericos = [
            'calorias_por_100g',
            'proteinas_por_100g',
            'carbohidratos_por_100g',
            'grasas_por_100g',
            'fibra_por_100g',
            'sodio_por_100g'
        ];
        
        foreach ($camposNumericos as $campo) {
            $data = [
                'nombre' => 'Alimento Test',
                'categoria' => 'fruta',
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5,
                $campo => -10 // Valor negativo
            ];
            
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(422);
            $response->assertJsonValidationErrors([$campo]);
        }
    }

    /** @test */
    public function property_categoria_debe_ser_valida()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $categoriasValidas = ['fruta', 'verdura', 'proteina', 'cereal', 'lacteo', 'grasa', 'otro'];
        $categoriasInvalidas = ['invalid', 'test', 'random', ''];

        // Probar categorías válidas
        foreach ($categoriasValidas as $categoria) {
            $data = [
                'nombre' => 'Alimento Test ' . $categoria,
                'categoria' => $categoria,
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ];
            
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(201);
        }

        // Probar categorías inválidas
        foreach ($categoriasInvalidas as $categoria) {
            $data = [
                'nombre' => 'Alimento Test Invalid',
                'categoria' => $categoria,
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ];
            
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['categoria']);
        }
    }

    /** @test */
    public function property_nombre_debe_ser_unico()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Crear primer alimento
        $data = [
            'nombre' => 'Manzana',
            'categoria' => 'fruta',
            'calorias_por_100g' => 52,
            'proteinas_por_100g' => 0.3,
            'carbohidratos_por_100g' => 14,
            'grasas_por_100g' => 0.2
        ];
        
        $response1 = $this->postJson('/api/alimentos', $data);
        $response1->assertStatus(201);

        // Intentar crear segundo alimento con el mismo nombre
        $response2 = $this->postJson('/api/alimentos', $data);
        $response2->assertStatus(422);
        $response2->assertJsonValidationErrors(['nombre']);
    }

    /** @test */
    public function property_nombre_longitud_minima_maxima()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Nombre muy corto (menos de 2 caracteres)
        $data = [
            'nombre' => 'A',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ];
        
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nombre']);

        // Nombre muy largo (más de 100 caracteres)
        $data['nombre'] = str_repeat('a', 101);
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nombre']);

        // Nombre válido
        $data['nombre'] = 'Manzana Verde';
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);
    }

    /** @test */
    public function property_descripcion_opcional_pero_con_limite()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Sin descripción (debe ser válido)
        $data = [
            'nombre' => 'Alimento Sin Descripción',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ];
        
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);

        // Con descripción válida
        $data['nombre'] = 'Alimento Con Descripción';
        $data['descripcion'] = 'Esta es una descripción válida';
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);

        // Descripción muy larga (más de 500 caracteres)
        $data['nombre'] = 'Alimento Descripción Larga';
        $data['descripcion'] = str_repeat('a', 501);
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['descripcion']);
    }

    /** @test */
    public function property_micronutrientes_opcionales_pero_numericos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $micronutrientes = [
            'fibra_por_100g',
            'azucares_por_100g',
            'sodio_por_100g',
            'potasio_por_100g',
            'calcio_por_100g',
            'hierro_por_100g',
            'vitamina_a_por_100g',
            'vitamina_c_por_100g'
        ];

        foreach ($micronutrientes as $micro) {
            // Sin el micronutriente (debe ser válido)
            $data = [
                'nombre' => 'Alimento Test ' . $micro,
                'categoria' => 'fruta',
                'calorias_por_100g' => 100,
                'proteinas_por_100g' => 10,
                'carbohidratos_por_100g' => 20,
                'grasas_por_100g' => 5
            ];
            
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(201);

            // Con valor numérico válido
            $data['nombre'] = 'Alimento Test ' . $micro . ' Valid';
            $data[$micro] = 5.5;
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(201);

            // Con valor no numérico (debe fallar)
            $data['nombre'] = 'Alimento Test ' . $micro . ' Invalid';
            $data[$micro] = 'invalid';
            $response = $this->postJson('/api/alimentos', $data);
            $response->assertStatus(422);
            $response->assertJsonValidationErrors([$micro]);
        }
    }

    /** @test */
    public function property_disponible_debe_ser_booleano()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Sin campo disponible (debe usar default true)
        $data = [
            'nombre' => 'Alimento Sin Disponible',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ];
        
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);
        $this->assertTrue($response->json('data.disponible'));

        // Con valor booleano true
        $data['nombre'] = 'Alimento Disponible True';
        $data['disponible'] = true;
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);
        $this->assertTrue($response->json('data.disponible'));

        // Con valor booleano false
        $data['nombre'] = 'Alimento Disponible False';
        $data['disponible'] = false;
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);
        $this->assertFalse($response->json('data.disponible'));

        // Con valor no booleano (debe fallar)
        $data['nombre'] = 'Alimento Disponible Invalid';
        $data['disponible'] = 'invalid';
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['disponible']);
    }

    /** @test */
    public function property_restricciones_opcional_pero_string()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        // Sin restricciones (debe ser válido)
        $data = [
            'nombre' => 'Alimento Sin Restricciones',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ];
        
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);

        // Con restricciones válidas
        $data['nombre'] = 'Alimento Con Restricciones';
        $data['restricciones'] = 'gluten, lactosa';
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);

        // Con restricciones no string (debe fallar)
        $data['nombre'] = 'Alimento Restricciones Invalid';
        $data['restricciones'] = ['gluten', 'lactosa'];
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['restricciones']);
    }

    /** @test */
    public function property_validacion_completa_con_todos_los_campos()
    {
        $this->actingAs($this->nutricionista->user, 'sanctum');

        $data = [
            'nombre' => 'Alimento Completo',
            'categoria' => 'proteina',
            'descripcion' => 'Descripción completa del alimento',
            'calorias_por_100g' => 150,
            'proteinas_por_100g' => 20,
            'carbohidratos_por_100g' => 10,
            'grasas_por_100g' => 5,
            'fibra_por_100g' => 2,
            'azucares_por_100g' => 1,
            'sodio_por_100g' => 0.5,
            'potasio_por_100g' => 300,
            'calcio_por_100g' => 50,
            'hierro_por_100g' => 2.5,
            'vitamina_a_por_100g' => 100,
            'vitamina_c_por_100g' => 10,
            'disponible' => true,
            'restricciones' => 'ninguna'
        ];
        
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);
        
        // Verificar que todos los campos se guardaron correctamente
        $alimento = Alimento::find($response->json('data.id_alimento'));
        $this->assertEquals($data['nombre'], $alimento->nombre);
        $this->assertEquals($data['categoria'], $alimento->categoria);
        $this->assertEquals($data['descripcion'], $alimento->descripcion);
        $this->assertEquals($data['calorias_por_100g'], $alimento->calorias_por_100g);
        $this->assertEquals($data['proteinas_por_100g'], $alimento->proteinas_por_100g);
        $this->assertEquals($data['carbohidratos_por_100g'], $alimento->carbohidratos_por_100g);
        $this->assertEquals($data['grasas_por_100g'], $alimento->grasas_por_100g);
        $this->assertEquals($data['fibra_por_100g'], $alimento->fibra_por_100g);
        $this->assertEquals($data['disponible'], $alimento->disponible);
    }

    /** @test */
    public function property_permisos_solo_nutricionista_y_admin()
    {
        // Crear usuario paciente (sin permisos)
        $pacienteUser = User::factory()->create(['role' => 'paciente']);
        
        $this->actingAs($pacienteUser, 'sanctum');

        $data = [
            'nombre' => 'Alimento Test',
            'categoria' => 'fruta',
            'calorias_por_100g' => 100,
            'proteinas_por_100g' => 10,
            'carbohidratos_por_100g' => 20,
            'grasas_por_100g' => 5
        ];
        
        // Intentar crear alimento como paciente
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(403); // Forbidden

        // Crear como nutricionista (debe funcionar)
        $this->actingAs($this->nutricionista->user, 'sanctum');
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);

        // Crear como admin (debe funcionar)
        $adminUser = User::factory()->create(['role' => 'admin']);
        $this->actingAs($adminUser, 'sanctum');
        $data['nombre'] = 'Alimento Test Admin';
        $response = $this->postJson('/api/alimentos', $data);
        $response->assertStatus(201);
    }
}
