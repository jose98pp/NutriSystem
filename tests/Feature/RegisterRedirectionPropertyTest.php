<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Feature: mejoras-sistema-core, Property 2: Successful registration redirects to login
 * Validates: Requirements 1.4
 */
class RegisterRedirectionPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 2: Successful registration redirects to login
     * For any completed registration, the system should return success response with user data
     */
    public function test_successful_registration_returns_proper_response_structure()
    {
        $userData = $this->generateValidUserData();
        
        $response = $this->postJson('/api/register', $userData);
        
        // Assert successful response with proper structure for frontend redirection
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'role'
                        ]
                    ]
                ]);
        
        $responseData = $response->json();
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Registro exitoso. Por favor verifica tu correo electrónico.', $responseData['message']);
    }

    /**
     * Test multiple successful registrations return consistent response format
     */
    public function test_multiple_registrations_consistent_response_format()
    {
        for ($i = 0; $i < 3; $i++) {
            $userData = $this->generateValidUserData();
            
            $response = $this->postJson('/api/register', $userData);
            
            // Each successful registration should have the same response structure
            $response->assertStatus(201)
                    ->assertJsonStructure([
                        'success',
                        'message',
                        'data' => [
                            'user' => [
                                'id',
                                'name',
                                'email',
                                'role'
                            ]
                        ]
                    ]);
            
            $responseData = $response->json();
            $this->assertTrue($responseData['success']);
        }
    }

    /**
     * Test that failed registration does not return success response
     */
    public function test_failed_registration_does_not_return_success_response()
    {
        // Invalid data (missing required fields)
        $invalidData = [
            'name' => 'Test',
            // Missing required fields
        ];
        
        $response = $this->postJson('/api/register', $invalidData);
        
        // Should not return success response
        $response->assertStatus(422);
        
        $responseData = $response->json();
        $this->assertArrayHasKey('errors', $responseData);
    }

    /**
     * Generate valid user data for testing
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
}
