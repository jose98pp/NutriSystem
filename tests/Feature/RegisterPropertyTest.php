<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Nutricionista;
use App\Models\Psicologo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

/**
 * Feature: mejoras-sistema-core, Property 1: Valid registration creates user and sends email
 * Validates: Requirements 1.2
 */
class RegisterPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 1: Valid registration creates user and sends email
     * For any valid user registration data, submitting the registration should create a user record and trigger email verification
     */
    public function test_valid_registration_creates_user_and_sends_email()
    {
        // Generate random valid user data
        $userData = $this->generateValidUserData();
        
        $response = $this->postJson('/api/register', $userData);
        
        // Debug: Ver el error si falla
        if ($response->status() !== 201) {
            dump($response->json());
        }
        
        // Assert response is successful
        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'message' => 'Registro exitoso. Por favor verifica tu correo electrónico.'
                ]);
        
        // Assert user was created in database
        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'name' => $userData['name'],
            'role' => $userData['role']
        ]);
        
        // Assert user has verification token
        $user = User::where('email', $userData['email'])->first();
        $this->assertNotNull($user->verification_token);
        $this->assertNotNull($user->verification_expires_at);
        $this->assertNull($user->email_verified_at);
        
        // Assert role-specific record was created
        switch ($userData['role']) {
            case 'paciente':
                $this->assertDatabaseHas('pacientes', [
                    'user_id' => $user->id,
                    'nombre' => $userData['name'],
                    'apellido' => $userData['apellido']
                ]);
                break;
            case 'nutricionista':
                $this->assertDatabaseHas('nutricionistas', [
                    'user_id' => $user->id,
                    'nombre' => $userData['name'],
                    'apellido' => $userData['apellido']
                ]);
                break;
            case 'psicologo':
                $this->assertDatabaseHas('psicologos', [
                    'user_id' => $user->id,
                    'nombre' => $userData['name'],
                    'apellido' => $userData['apellido']
                ]);
                break;
        }
    }

    /**
     * Test with multiple random valid datasets
     */
    public function test_multiple_valid_registrations()
    {
        for ($i = 0; $i < 5; $i++) {
            $userData = $this->generateValidUserData();
            
            $response = $this->postJson('/api/register', $userData);
            
            // Debug: Ver el error si falla
            if ($response->status() !== 201) {
                dump("Iteration $i failed:", $response->json());
            }
            
            $response->assertStatus(201)
                    ->assertJson(['success' => true]);
            
            $this->assertDatabaseHas('users', [
                'email' => $userData['email'],
                'role' => $userData['role']
            ]);
        }
    }

    /**
     * Generate valid user data with random values
     */
    private function generateValidUserData(): array
    {
        $roles = ['paciente', 'nutricionista', 'psicologo'];
        $password = 'ValidPass123';
        
        return [
            'name' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => $password,
            'password_confirmation' => $password,
            'telefono' => fake()->phoneNumber(),
            'fecha_nacimiento' => fake()->date('Y-m-d', '-18 years'),
            'role' => fake()->randomElement($roles)
        ];
    }

    /**
     * Test duplicate email rejection
     */
    public function test_duplicate_email_rejection()
    {
        $email = 'duplicate@example.com';
        
        // Create first user
        $firstUser = $this->generateValidUserData();
        $firstUser['email'] = $email;
        
        $response1 = $this->postJson('/api/register', $firstUser);
        $response1->assertStatus(201);
        
        // Try to create second user with same email
        $secondUser = $this->generateValidUserData();
        $secondUser['email'] = $email;
        
        $response2 = $this->postJson('/api/register', $secondUser);
        $response2->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }
}
