<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * Feature: production-auth-fix, Property 18: Logs contain context without sensitive data
 * Validates: Requirements 7.5
 */
class LogSafetyPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 18: Logs contain context without sensitive data
     * For any log entry, it should contain sufficient context to diagnose issues 
     * but should not expose sensitive information like passwords or full tokens.
     */
    public function test_login_logs_do_not_contain_passwords()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('SecretPassword123!'),
        ]);

        // Verify that no log contains password
        Log::shouldReceive('info')
            ->atLeast()->once()
            ->withArgs(function ($message, $context) {
                return !isset($context['password']) 
                    && !str_contains(json_encode($context), 'SecretPassword123!');
            });

        Log::shouldReceive('warning')
            ->never()
            ->withArgs(function ($message, $context) {
                return isset($context['password']);
            });

        // Attempt login
        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'SecretPassword123!',
        ]);
    }

    /**
     * Test that registration logs do not contain passwords
     */
    public function test_registration_logs_do_not_contain_passwords()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'newuser@example.com',
            'password' => 'VerySecretPassword123!',
            'password_confirmation' => 'VerySecretPassword123!',
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
        ];

        // Verify that no log contains password
        Log::shouldReceive('info')
            ->atLeast()->once()
            ->withArgs(function ($message, $context) {
                return !isset($context['password']) 
                    && !isset($context['password_confirmation'])
                    && !str_contains(json_encode($context), 'VerySecretPassword123!');
            });

        // Attempt registration
        $this->postJson('/api/register', $userData);
    }

    /**
     * Test that logs contain sufficient diagnostic context
     */
    public function test_logs_contain_sufficient_diagnostic_context()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Verify logs contain useful context
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login attempt started'
                    && isset($context['email'])
                    && isset($context['timestamp'])
                    && isset($context['ip'])
                    && isset($context['user_agent']);
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

        // Attempt login
        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);
    }

    /**
     * Test that error logs do not expose internal details
     */
    public function test_error_logs_do_not_expose_sensitive_internal_details()
    {
        // Attempt login with non-existent user
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Login attempt started';
            });

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                // Should log reason but not expose database structure or queries
                return $message === 'Login failed - Invalid credentials'
                    && isset($context['reason'])
                    && !str_contains(json_encode($context), 'SELECT')
                    && !str_contains(json_encode($context), 'users table');
            });

        $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'somepassword',
        ]);
    }
}
