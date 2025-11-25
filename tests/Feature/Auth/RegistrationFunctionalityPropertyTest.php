<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

/**
 * Feature: production-auth-fix, Properties 7, 9, 12
 * Validates: Requirements 3.1, 3.3, 3.4, 5.3
 */
class RegistrationFunctionalityPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 7: Valid registration data creates users
     */
    public function test_valid_registration_creates_users()
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

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201);
        $response->assertJsonStructure(['message', 'user', 'access_token']);
        
        // Verify user was created with ID
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => 'paciente',
        ]);
        
        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertNotNull($user->id);
    }

    /**
     * Property 9: Users are assigned correct roles
     */
    public function test_users_are_assigned_correct_roles()
    {
        $roles = ['paciente'];
        
        foreach ($roles as $role) {
            $userData = [
                'name' => "User {$role}",
                'email' => "{$role}@example.com",
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => $role,
                'fecha_nacimiento' => '1990-01-01',
                'genero' => 'M',
            ];

            $response = $this->postJson('/api/register', $userData);

            $response->assertStatus(201);
            
            $this->assertDatabaseHas('users', [
                'email' => "{$role}@example.com",
                'role' => $role,
            ]);
        }
    }

    /**
     * Property 12: Passwords are hashed with bcrypt
     */
    public function test_passwords_are_hashed_with_bcrypt()
    {
        $plainPassword = 'MySecretPassword123!';
        
        $userData = [
            'name' => 'Test User',
            'email' => 'secure@example.com',
            'password' => $plainPassword,
            'password_confirmation' => $plainPassword,
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'F',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201);
        
        $user = User::where('email', 'secure@example.com')->first();
        
        // Verify password is hashed (not plain text)
        $this->assertNotEquals($plainPassword, $user->password);
        
        // Verify it's a bcrypt hash (starts with $2y$)
        $this->assertStringStartsWith('$2y$', $user->password);
        
        // Verify the hash can be verified
        $this->assertTrue(Hash::check($plainPassword, $user->password));
    }

    /**
     * Test duplicate email rejection
     */
    public function test_duplicate_email_is_rejected()
    {
        // Create first user
        User::factory()->create(['email' => 'duplicate@example.com']);

        // Try to create second user with same email
        $userData = [
            'name' => 'Second User',
            'email' => 'duplicate@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'paciente',
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * Test multiple random registrations
     */
    public function test_multiple_registrations()
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

            $response = $this->postJson('/api/register', $userData);

            $response->assertStatus(201);
            $this->assertDatabaseHas('users', ['email' => "user{$i}@example.com"]);
        }
    }
}
