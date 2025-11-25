<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Nutricionista;
use App\Models\Sesion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

/**
 * Feature: mejoras-sistema-core, Property 18: Join generates or retrieves valid Zoom link
 * Validates: Requirements 5.2
 */
class VideollamadaJoinPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 18: Join generates or retrieves valid Zoom link
     * For any valid videollamada session, clicking join should either generate a new Zoom link or retrieve an existing valid one
     */
    public function test_join_generates_or_retrieves_valid_zoom_link()
    {
        // Create test data
        [$paciente, $nutricionista, $sesion] = $this->createTestData();
        
        // Authenticate as paciente
        Sanctum::actingAs($paciente->user, ['*']);
        
        // First join - should generate link
        $response = $this->postJson("/api/videollamada/{$sesion->id_sesion}/join");
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id_sesion',
                        'estado'
                    ]
                ]);
        
        $data = $response->json('data');
        
        // Should have either Zoom URL or Jitsi link
        $this->assertTrue(
            isset($data['zoom_join_url']) || isset($data['link_videollamada']),
            'Response should contain either zoom_join_url or link_videollamada'
        );
        
        // Verify session state was updated
        $sesion->refresh();
        $this->assertEquals('EN_CURSO', $sesion->estado);
        $this->assertNotNull($sesion->participante_unido_at);
        
        // Second join - should retrieve same link
        $response2 = $this->postJson("/api/videollamada/{$sesion->id_sesion}/join");
        
        $response2->assertStatus(200);
        $data2 = $response2->json('data');
        
        // Links should be consistent
        if (isset($data['zoom_join_url'])) {
            $this->assertEquals($data['zoom_join_url'], $data2['zoom_join_url']);
        } else {
            $this->assertEquals($data['link_videollamada'], $data2['link_videollamada']);
        }
    }

    /**
     * Test with multiple random sessions
     */
    public function test_multiple_sessions_generate_unique_links()
    {
        $links = [];
        
        for ($i = 0; $i < 3; $i++) {
            [$paciente, $nutricionista, $sesion] = $this->createTestData();
            
            Sanctum::actingAs($paciente->user, ['*']);
            
            $response = $this->postJson("/api/videollamada/{$sesion->id_sesion}/join");
            
            $response->assertStatus(200);
            $data = $response->json('data');
            
            $link = $data['zoom_join_url'] ?? $data['link_videollamada'];
            $this->assertNotNull($link);
            
            // Each session should have a unique link
            $this->assertNotContains($link, $links, "Link should be unique for each session");
            $links[] = $link;
        }
    }

    /**
     * Test unauthorized access is rejected
     */
    public function test_unauthorized_join_is_rejected()
    {
        [$paciente, $nutricionista, $sesion] = $this->createTestData();
        
        // Create another paciente who shouldn't have access
        $otherPaciente = $this->createPaciente();
        
        Sanctum::actingAs($otherPaciente->user, ['*']);
        
        $response = $this->postJson("/api/videollamada/{$sesion->id_sesion}/join");
        
        $response->assertStatus(403)
                ->assertJson([
                    'message' => 'No tienes permiso para unirte a esta videollamada'
                ]);
    }

    /**
     * Test joining non-videollamada session is rejected
     */
    public function test_joining_non_videollamada_is_rejected()
    {
        [$paciente, $nutricionista, $sesion] = $this->createTestData();
        
        // Change session type to PRESENCIAL
        $sesion->update(['tipo_sesion' => 'PRESENCIAL']);
        
        Sanctum::actingAs($paciente->user, ['*']);
        
        $response = $this->postJson("/api/videollamada/{$sesion->id_sesion}/join");
        
        $response->assertStatus(400)
                ->assertJson([
                    'message' => 'Esta sesión no es de tipo videollamada'
                ]);
    }

    /**
     * Create test data
     */
    private function createTestData(): array
    {
        $paciente = $this->createPaciente();
        $nutricionista = $this->createNutricionista();
        
        $sesion = Sesion::create([
            'id_paciente' => $paciente->id_paciente,
            'profesional_id' => $nutricionista->id_nutricionista,
            'tipo_profesional' => 'NUTRICIONISTA',
            'tipo_sesion' => 'VIDEOLLAMADA',
            'fecha_hora' => now()->addHours(1),
            'duracion_minutos' => 60,
            'estado' => 'PROGRAMADA',
            'motivo' => 'Consulta nutricional'
        ]);
        
        return [$paciente, $nutricionista, $sesion];
    }

    /**
     * Create a test paciente
     */
    private function createPaciente(): Paciente
    {
        $email = fake()->unique()->safeEmail();
        $user = User::create([
            'name' => fake()->firstName(),
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => 'paciente',
            'email_verified_at' => now()
        ]);
        
        return Paciente::create([
            'user_id' => $user->id,
            'nombre' => $user->name,
            'apellido' => fake()->lastName(),
            'email' => $email,
            'telefono' => fake()->phoneNumber(),
            'fecha_nacimiento' => fake()->date('Y-m-d', '-25 years'),
            'genero' => fake()->randomElement(['M', 'F'])
        ]);
    }

    /**
     * Create a test nutricionista
     */
    private function createNutricionista(): Nutricionista
    {
        $email = fake()->unique()->safeEmail();
        $user = User::create([
            'name' => fake()->firstName(),
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => 'nutricionista',
            'email_verified_at' => now()
        ]);
        
        return Nutricionista::create([
            'user_id' => $user->id,
            'nombre' => $user->name,
            'apellido' => fake()->lastName(),
            'email' => $email,
            'telefono' => fake()->phoneNumber(),
            'cedula_profesional' => fake()->numerify('########')
        ]);
    }
}
