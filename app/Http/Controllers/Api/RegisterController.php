<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Nutricionista;
use App\Models\Psicologo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use App\Services\EmailVerificationService;

class RegisterController extends Controller
{
    protected $emailVerificationService;

    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        // Validar datos de entrada
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
            ],
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date|before:today',
        ], [
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password.mixed_case' => 'La contraseña debe contener mayúsculas y minúsculas',
            'password.numbers' => 'La contraseña debe contener números',
            'email.unique' => 'Este correo electrónico ya está registrado',
        ]);

        // Por defecto, todos los registros públicos son pacientes
        $validated['role'] = 'paciente';

        DB::beginTransaction();
        try {
            // Generar token de verificación
            $verificationToken = Str::random(64);
            
            // Crear usuario
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'telefono' => $validated['telefono'] ?? null,
                'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
                'verification_token' => $verificationToken,
                'verification_expires_at' => now()->addHours(24),
            ]);

            // Crear registro específico según el rol
            switch ($validated['role']) {
                case 'paciente':
                    Paciente::create([
                        'user_id' => $user->id,
                        'nombre' => $validated['name'],
                        'apellido' => $validated['apellido'],
                        'email' => $validated['email'],
                        'celular' => $validated['telefono'] ?? null,
                        'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? now()->subYears(25)->format('Y-m-d'), // Valor por defecto si no se proporciona
                        'genero' => 'Otro', // Valor por defecto, se puede actualizar después
                    ]);
                    break;
                    
                case 'nutricionista':
                    Nutricionista::create([
                        'user_id' => $user->id,
                        'nombre' => $validated['name'],
                        'apellido' => $validated['apellido'],
                        'email' => $validated['email'],
                        'celular' => $validated['telefono'] ?? null,
                    ]);
                    break;
                    
                case 'psicologo':
                    Psicologo::create([
                        'user_id' => $user->id,
                        'nombre' => $validated['name'],
                        'apellido' => $validated['apellido'],
                        'email' => $validated['email'],
                        'celular' => $validated['telefono'] ?? null,
                    ]);
                    break;
            }

            DB::commit();

            // Enviar email de verificación
            $this->emailVerificationService->sendVerificationEmail($user);

            // Crear token para login automático
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registro exitoso. Por favor verifica tu correo electrónico.',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'telefono' => $user->telefono,
                    'fecha_nacimiento' => $user->fecha_nacimiento,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en registro: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar email con token
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string'
        ]);

        $result = $this->emailVerificationService->verifyEmail(
            $request->email,
            $request->token
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Reenviar email de verificación
     */
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $result = $this->emailVerificationService->resendVerificationEmail($request->email);

        return response()->json($result, $result['success'] ? 200 : 400);
    }
}
