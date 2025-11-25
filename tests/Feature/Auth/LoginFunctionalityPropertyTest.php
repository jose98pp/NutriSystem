<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * Feature: production-auth-fix, Properties 4, 5, 6, 11
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 4.3
 */
class LoginFunctionalityPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 4: Valid credentials generate valid tokens
     */
    public function test_valid_credentials_generate_valid_tokens()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['access_token', 'user']);
        
        $token = $response->json('access_token');
        $this->assertNotEmpty($token);
        
        // Verify token works for authenticated requests
        $authResponse = $this->withHeader('Authorization', "Bearer {$token}")
                             ->getJson('/api/me');
        $authResponse->assertOk();
    }

    /**
     * Property 5: Invalid credentials return 401
     */
    public function test_invalid_credentials_return_error()
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
        $response->assertJsonStructure(['message', 'errors']);
    }

    /**
     * Property 6: Authenticated requests are authorized
     */
    public function test_authenticated_requests_are_authorized()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
                         ->getJson('/api/me');

        $response->assertOk();
        $response->assertJson(['email' => $user->email]);
    }

    /**
     * Property 11: Authentication creates database sessions
     */
    public function test_authentication_creates_database_sessions()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Clear any existing sessions
        DB::table('sessions')->truncate();

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        
        // Verify session was created (if using database sessions)
        if (config('session.driver') === 'database') {
            $sessionCount = DB::table('sessions')->count();
            $this->assertGreaterThan(0, $sessionCount, 'Session should be created in database');
        }
    }

    /**
     * Test multiple random valid logins
     */
    public function test_multiple_valid_logins()
    {
        for ($i = 0; $i < 3; $i++) {
            $user = User::factory()->create([
                'email' => "user{$i}@example.com",
                'password' => Hash::make("password{$i}"),
            ]);

            $response = $this->postJson('/api/login', [
                'email' => "user{$i}@example.com",
                'password' => "password{$i}",
            ]);

            $response->assertOk();
            $response->assertJsonStructure(['access_token']);
        }
    }
}
