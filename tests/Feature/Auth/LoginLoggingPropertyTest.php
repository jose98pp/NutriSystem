<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * Feature: production-auth-fix, Property 1: Login attempts are logged
 * Validates: Requirements 1.1
 */
class LoginLoggingPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 1: Login attempts are logged
     * For any login attempt (successful or failed), the system should create a log entry 
     * containing the email, timestamp, and outcome of the authentication attempt.
     */
    public function test_successful_login_attempts_are_logged()
    {
        // Arrange: Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Capture logs
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login attempt started' 
                    && isset($context['email'])
                    && isset($context['timestamp'])
                    && isset($context['ip']);
            });

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Generating authentication token'
                    && isset($context['user_id'])
                    && isset($context['email'])
                    && isset($context['role']);
            });

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login successful'
                    && isset($context['user_id'])
                    && isset($context['email'])
                    && isset($context['role'])
                    && isset($context['timestamp'])
                    && isset($context['ip']);
            });

        // Act: Attempt login
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Assert: Login was successful
        $response->assertOk();
    }

    /**
     * Test that failed login attempts are logged with appropriate context
     */
    public function test_failed_login_attempts_are_logged()
    {
        // Arrange: Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('correctpassword'),
        ]);

        // Capture logs
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login attempt started'
                    && $context['email'] === 'test@example.com';
            });

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login failed - Invalid credentials'
                    && $context['email'] === 'test@example.com'
                    && isset($context['reason'])
                    && isset($context['timestamp']);
            });

        // Act: Attempt login with wrong password
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        // Assert: Login failed
        $response->assertStatus(422);
    }

    /**
     * Test that login attempts for non-existent users are logged
     */
    public function test_login_attempts_for_nonexistent_users_are_logged()
    {
        // Capture logs
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login attempt started'
                    && $context['email'] === 'nonexistent@example.com';
            });

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login failed - Invalid credentials'
                    && $context['email'] === 'nonexistent@example.com'
                    && $context['reason'] === 'user_not_found';
            });

        // Act: Attempt login with non-existent email
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'somepassword',
        ]);

        // Assert: Login failed
        $response->assertStatus(422);
    }

    /**
     * Test multiple random login attempts are all logged
     */
    public function test_multiple_login_attempts_are_logged()
    {
        for ($i = 0; $i < 5; $i++) {
            $email = "user{$i}@example.com";
            $password = "password{$i}";

            // Create user
            User::factory()->create([
                'email' => $email,
                'password' => Hash::make($password),
            ]);

            // Expect logs for each attempt
            Log::shouldReceive('info')
                ->times(3) // start, token generation, success
                ->withArgs(function ($message, $context) use ($email) {
                    return isset($context['email']) || isset($context['user_id']);
                });

            // Attempt login
            $response = $this->postJson('/api/login', [
                'email' => $email,
                'password' => $password,
            ]);

            $response->assertOk();
        }
    }
}
