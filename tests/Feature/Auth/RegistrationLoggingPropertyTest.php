<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

/**
 * Feature: production-auth-fix, Property 2: Registration attempts are logged
 * Validates: Requirements 1.2
 */
class RegistrationLoggingPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 2: Registration attempts are logged
     * For any registration attempt, the system should create a log entry containing 
     * the submitted data (excluding password) and the result of the operation.
     */
    public function test_successful_registration_attempts_are_logged()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
        ];

        // Capture logs
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) use ($userData) {
                return $message === 'Registration attempt started'
                    && $context['email'] === $userData['email']
                    && $context['name'] === $userData['name']
                    && $context['role'] === $userData['role']
                    && isset($context['timestamp'])
                    && !isset($context['password']); // Password should NOT be logged
            });

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'User created successfully'
                    && isset($context['user_id'])
                    && isset($context['email'])
                    && isset($context['role']);
            });

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) use ($userData) {
                return $message === 'Registration successful'
                    && isset($context['user_id'])
                    && $context['email'] === $userData['email']
                    && isset($context['timestamp']);
            });

        // Act: Attempt registration
        $response = $this->postJson('/api/register', $userData);

        // Assert: Registration was successful
        $response->assertStatus(201);
    }

    /**
     * Test that failed registration attempts are logged with validation errors
     */
    public function test_failed_registration_with_validation_errors_is_logged()
    {
        $invalidData = [
            'name' => 'Test User',
            'email' => 'invalid-email', // Invalid email format
            'password' => '123', // Too short
            'password_confirmation' => '123',
        ];

        // Capture logs
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Registration attempt started'
                    && isset($context['email'])
                    && !isset($context['password']); // Password should NOT be logged
            });

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Registration failed - Validation error'
                    && isset($context['errors'])
                    && isset($context['timestamp'])
                    && !isset($context['password']); // Password should NOT be logged
            });

        // Act: Attempt registration with invalid data
        $response = $this->postJson('/api/register', $invalidData);

        // Assert: Registration failed with validation errors
        $response->assertStatus(422);
    }

    /**
     * Test that duplicate email registration attempts are logged
     */
    public function test_duplicate_email_registration_is_logged()
    {
        // Create existing user
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $userData = [
            'name' => 'New User',
            'email' => 'existing@example.com', // Duplicate email
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
        ];

        // Capture logs
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Registration attempt started';
            });

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Registration failed - Validation error'
                    && isset($context['errors']['email']); // Should have email error
            });

        // Act: Attempt registration with duplicate email
        $response = $this->postJson('/api/register', $userData);

        // Assert: Registration failed
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test that passwords are never logged in registration attempts
     */
    public function test_passwords_are_never_logged_in_registration()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'secure@example.com',
            'password' => 'SuperSecret123!',
            'password_confirmation' => 'SuperSecret123!',
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'F',
        ];

        // Capture all logs and verify password is never present
        Log::shouldReceive('info')
            ->times(3)
            ->withArgs(function ($message, $context) {
                // Ensure password is NEVER in any log context
                return !isset($context['password']) 
                    && !isset($context['password_confirmation']);
            });

        // Act: Attempt registration
        $response = $this->postJson('/api/register', $userData);

        // Assert: Registration was successful
        $response->assertStatus(201);
    }

    /**
     * Test multiple random registration attempts are all logged
     */
    public function test_multiple_registration_attempts_are_logged()
    {
        for ($i = 0; $i < 3; $i++) {
            $userData = [
                'name' => "User {$i}",
                'email' => "user{$i}@example.com",
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => 'paciente',
                'fecha_nacimiento' => '1990-01-01',
                'genero' => $i % 2 === 0 ? 'M' : 'F',
            ];

            // Expect logs for each attempt (start, user created, success)
            Log::shouldReceive('info')
                ->times(3)
                ->withArgs(function ($message, $context) {
                    return !isset($context['password']);
                });

            // Attempt registration
            $response = $this->postJson('/api/register', $userData);

            $response->assertStatus(201);
        }
    }
}
