<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Feature: mejoras-sistema-core, Property 3: Password validation enforces security rules
 * Validates: Requirements 1.5
 */
class PasswordValidationPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Property 3: Password validation enforces security rules
     * For any password input, the system should accept it only if it has at least 8 characters, 
     * contains uppercase, lowercase, and numbers
     */
    public function test_password_validation_enforces_all_security_rules()
    {
        $baseUserData = [
            'name' => 'Test',
            'apellido' => 'User',
            'telefono' => '1234567890',
            'role' => 'paciente'
        ];

        // Test cases: [password, should_pass, description]
        $passwordTestCases = [
            // Valid passwords
            ['ValidPass123', true, 'Valid password with all requirements'],
            ['MySecure1', true, 'Minimum valid password'],
            ['Test1234', true, 'Simple valid password'],
            ['Aa1bcdef', true, 'Minimum length with all requirements'],
            
            // Invalid passwords - too short
            ['Short1', false, 'Too short (6 chars)'],
            ['Test12', false, 'Too short (7 chars)'],
            
            // Invalid passwords - missing uppercase
            ['lowercase123', false, 'Missing uppercase letters'],
            ['test12345', false, 'No uppercase letters'],
            
            // Invalid passwords - missing lowercase
            ['UPPERCASE123', false, 'Missing lowercase letters'],
            ['TEST12345', false, 'No lowercase letters'],
            
            // Invalid passwords - missing numbers
            ['NoNumbers', false, 'Missing numbers'],
            ['TestPassword', false, 'Valid case but no digits'],
        ];

        foreach ($passwordTestCases as $index => [$password, $shouldPass, $description]) {
            $userData = array_merge($baseUserData, [
                'email' => "test{$index}@example.com", // Unique email for each test
                'password' => $password,
                'password_confirmation' => $password
            ]);

            $response = $this->postJson('/api/register', $userData);

            if ($shouldPass) {
                $response->assertStatus(201, "Failed: {$description} - Password: '{$password}'");
            } else {
                $response->assertStatus(422, "Failed: {$description} - Password: '{$password}' should be rejected")
                        ->assertJsonValidationErrors(['password']);
            }
        }
    }

    /**
     * Test password confirmation validation
     */
    public function test_password_confirmation_must_match()
    {
        $baseUserData = [
            'name' => 'Test',
            'apellido' => 'User',
            'telefono' => '1234567890',
            'role' => 'paciente'
        ];

        // Test mismatched password confirmation
        $mismatchedCases = [
            ['ValidPass123', 'DifferentPass123'],
            ['MyPassword1', 'MyPassword2'],
        ];

        foreach ($mismatchedCases as $index => [$password, $confirmation]) {
            $userData = array_merge($baseUserData, [
                'email' => "mismatch{$index}@example.com",
                'password' => $password,
                'password_confirmation' => $confirmation
            ]);

            $response = $this->postJson('/api/register', $userData);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['password']);
        }

        // Test matching password confirmation
        $matchedCases = [
            'ValidPass123',
            'MyPassword1',
        ];

        foreach ($matchedCases as $index => $password) {
            $userData = array_merge($baseUserData, [
                'email' => "match{$index}@example.com",
                'password' => $password,
                'password_confirmation' => $password
            ]);

            $response = $this->postJson('/api/register', $userData);
            
            $response->assertStatus(201);
        }
    }

    /**
     * Test edge cases for password validation
     */
    public function test_password_validation_edge_cases()
    {
        $baseUserData = [
            'name' => 'Test',
            'apellido' => 'User',
            'telefono' => '1234567890',
            'role' => 'paciente'
        ];

        // Edge cases
        $edgeCases = [
            // Exactly 8 characters with all requirements
            ['Aa1bcdef', true, 'Exactly 8 characters'],
            
            // Special characters (should be allowed)
            ['MyPass1!', true, 'With special characters'],
            ['Test@123', true, 'With @ symbol'],
            
            // Very long password
            ['VeryLongPasswordWith123Numbers', true, 'Very long password'],
            
            // Just missing one requirement
            ['Aa1bcde', false, 'Exactly 7 characters (one short)'],
        ];

        foreach ($edgeCases as $index => [$password, $shouldPass, $description]) {
            $userData = array_merge($baseUserData, [
                'email' => "edge{$index}@example.com",
                'password' => $password,
                'password_confirmation' => $password
            ]);

            $response = $this->postJson('/api/register', $userData);

            if ($shouldPass) {
                $response->assertStatus(201, "Failed: {$description} - Password: '{$password}'");
            } else {
                $response->assertStatus(422, "Failed: {$description} - Password: '{$password}' should be rejected")
                        ->assertJsonValidationErrors(['password']);
            }
        }
    }
}
