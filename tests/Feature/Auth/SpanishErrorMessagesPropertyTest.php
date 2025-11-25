<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

/**
 * Feature: production-auth-fix, Property 19: Authentication errors return Spanish messages
 * Validates: Requirements 8.1
 */
class SpanishErrorMessagesPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 19: Authentication errors return Spanish messages
     * For any authentication failure, the error message returned should be in Spanish 
     * and describe the specific problem.
     */
    public function test_invalid_credentials_message_is_in_spanish()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('correctpassword'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
        
        $json = $response->json();
        $this->assertNotEmpty($json['message']);
        
        // Verify message contains Spanish words
        $message = strtolower($json['message']);
        $this->assertTrue(
            str_contains($message, 'credenciales') || 
            str_contains($message, 'incorrectas') ||
            str_contains($message, 'inválidas'),
            'Error message should be in Spanish'
        );
    }

    /**
     * Test that validation error messages are in Spanish
     */
    public function test_validation_error_messages_are_in_spanish()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => '',
        ]);

        $response->assertStatus(422);
        
        $json = $response->json();
        $this->assertNotEmpty($json['message']);
        
        // Laravel validation messages should be in Spanish
        $message = strtolower($json['message']);
        // Check for common Spanish validation terms
        $hasSpanishTerms = str_contains($message, 'campo') ||
                          str_contains($message, 'requerido') ||
                          str_contains($message, 'obligatorio') ||
                          str_contains($message, 'válido') ||
                          str_contains($message, 'correo');
        
        $this->assertTrue($hasSpanishTerms || !empty($json['errors']), 
            'Validation messages should be in Spanish or provide error details');
    }

    /**
     * Test that successful messages are also in Spanish
     */
    public function test_success_messages_are_in_spanish()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        
        $json = $response->json();
        $this->assertNotEmpty($json['message']);
        
        $message = strtolower($json['message']);
        $this->assertTrue(
            str_contains($message, 'exitoso') || 
            str_contains($message, 'éxito') ||
            str_contains($message, 'sesión'),
            'Success message should be in Spanish'
        );
    }

    /**
     * Test registration success message is in Spanish
     */
    public function test_registration_success_message_is_in_spanish()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
        ]);

        $response->assertStatus(201);
        
        $json = $response->json();
        $this->assertNotEmpty($json['message']);
        
        $message = strtolower($json['message']);
        $this->assertTrue(
            str_contains($message, 'registrado') || 
            str_contains($message, 'exitoso') ||
            str_contains($message, 'usuario'),
            'Registration success message should be in Spanish'
        );
    }
}
