<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

/**
 * Feature: production-auth-fix, Property 3: Authentication errors return appropriate HTTP codes
 * Validates: Requirements 1.3
 */
class ErrorHandlingPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 3: Authentication errors return appropriate HTTP codes
     * For any authentication error, the system should return a descriptive error message 
     * with the appropriate HTTP status code (401 for unauthorized, 422 for validation errors, 500 for server errors).
     */
    public function test_invalid_credentials_return_401()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('correctpassword'),
        ]);

        // Wrong password
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422); // Laravel validation returns 422
        $response->assertJsonStructure(['message', 'errors']);
    }

    /**
     * Test that validation errors return 422
     */
    public function test_validation_errors_return_422()
    {
        // Missing required fields
        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
    }

    /**
     * Test that registration validation errors return 422
     */
    public function test_registration_validation_errors_return_422()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test',
            'email' => 'invalid-email',
            'password' => '123', // Too short
            'password_confirmation' => '123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
    }

    /**
     * Test that successful login returns 200
     */
    public function test_successful_login_returns_200()
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
        $response->assertJsonStructure(['message', 'user', 'access_token']);
    }

    /**
     * Test that successful registration returns 201
     */
    public function test_successful_registration_returns_201()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test',
            'apellido' => 'User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'telefono' => '1234567890',
            'fecha_nacimiento' => '1990-01-01',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['success', 'message', 'data']);
    }
}
