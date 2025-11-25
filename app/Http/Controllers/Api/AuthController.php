<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use App\Models\Nutricionista;
use App\Models\Servicio;
use App\Models\Suscripcion;
use App\Models\Evaluacion;
use App\Models\Medicion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario
     */
    public function register(Request $request)
    {
        $timestamp = now()->toIso8601String();
        $email = $request->email;

        // Log inicio de petición de registro (sin contraseña)
        Log::info('Registration attempt started', [
            'email' => $email,
            'name' => $request->name,
            'role' => $request->role ?? 'paciente',
            'timestamp' => $timestamp,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|string|email|max:150|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'sometimes|in:admin,nutricionista,paciente',
                'fecha_nacimiento' => 'required_if:role,paciente|date',
                'genero' => 'required_if:role,paciente|in:M,F,Otro',
                'telefono' => 'nullable|string|max:20',
                'id_nutricionista' => 'sometimes|exists:nutricionistas,id_nutricionista',
                'servicio_id' => 'sometimes|exists:servicios,id_servicio',
                'medicion.peso_kg' => 'sometimes|numeric|min:20|max:300',
                'medicion.altura_m' => 'sometimes|numeric|min:0.5|max:2.5',
                'medicion.porc_grasa' => 'nullable|numeric|min:0|max:100',
                'medicion.masa_magra_kg' => 'nullable|numeric|min:0',
            ]);
        } catch (ValidationException $e) {
            // Log error de validación
            Log::warning('Registration failed - Validation error', [
                'email' => $email,
                'timestamp' => $timestamp,
                'errors' => $e->errors(),
                'ip' => $request->ip(),
            ]);
            throw $e;
        }

        DB::beginTransaction();

        try {
            $role = $request->role ?? 'paciente';

            // Crear usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $role,
                'telefono' => $request->telefono,
            ]);

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ]);

            // Si es paciente, crear registro en tabla pacientes
            if ($role === 'paciente') {
                // Separar nombre y apellido
                $nameParts = explode(' ', $request->name, 2);
                $nombre = $nameParts[0];
                $apellido = $nameParts[1] ?? '';

                $paciente = Paciente::create([
                    'user_id' => $user->id,
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'fecha_nacimiento' => $request->fecha_nacimiento,
                    'genero' => $request->genero,
                    'email' => $request->email,
                    'telefono' => $request->telefono,
                    'peso_inicial' => null,
                    'estatura' => null,
                    'alergias' => null,
                    'id_nutricionista' => null,
                ]);

                // Agregar id_paciente al usuario
                $user->id_paciente = $paciente->id_paciente;
                $user->paciente = $paciente;

                if ($request->filled('id_nutricionista')) {
                    $paciente->id_nutricionista = $request->id_nutricionista;
                    $paciente->save();
                }

                if ($request->has('medicion.peso_kg') && $request->has('medicion.altura_m')) {
                    $evaluacion = Evaluacion::create([
                        'id_paciente' => $paciente->id_paciente,
                        'id_nutricionista' => $request->id_nutricionista,
                        'tipo' => 'INICIAL',
                        'fecha' => now(),
                        'observaciones' => '',
                    ]);
                    Medicion::create([
                        'id_evaluacion' => $evaluacion->id_evaluacion,
                        'peso_kg' => $request->input('medicion.peso_kg'),
                        'altura_m' => $request->input('medicion.altura_m'),
                        'porc_grasa' => $request->input('medicion.porc_grasa'),
                        'masa_magra_kg' => $request->input('medicion.masa_magra_kg'),
                    ]);
                }

                if ($request->filled('servicio_id')) {
                    $servicio = Servicio::find($request->servicio_id);
                    if ($servicio) {
                        Suscripcion::create([
                            'user_id' => $user->id,
                            'servicio_id' => $servicio->id_servicio,
                            'estado' => 'activa',
                            'fecha_inicio' => now(),
                            'fecha_fin' => now()->addDays($servicio->duracion_dias),
                            'proximo_cobro' => now()->addDays($servicio->duracion_dias),
                            'metodo_pago' => json_encode([
                                'tipo' => 'onboarding',
                                'nombre' => 'Registro',
                            ]),
                        ]);
                    }
                }
            }

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            // Log registro exitoso
            Log::info('Registration successful', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'timestamp' => $timestamp,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log error de registro (sin datos sensibles)
            Log::error('Registration failed - Database error', [
                'email' => $email,
                'role' => $request->role ?? 'paciente',
                'timestamp' => $timestamp,
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Error al registrar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    public function finalizeOnboarding(Request $request)
    {
        $request->validate([
            'servicio_id' => 'required|exists:servicios,id_servicio',
            'id_nutricionista' => 'required|exists:nutricionistas,id_nutricionista',
            'medicion.peso_kg' => 'required|numeric|min:20|max:300',
            'medicion.altura_m' => 'required|numeric|min:0.5|max:2.5',
            'medicion.porc_grasa' => 'nullable|numeric|min:0|max:100',
            'medicion.masa_magra_kg' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $user = $request->user();
            $paciente = Paciente::where('user_id', $user->id)->firstOrFail();

            $paciente->id_nutricionista = $request->id_nutricionista;
            $paciente->save();

            $evaluacion = Evaluacion::create([
                'id_paciente' => $paciente->id_paciente,
                'id_nutricionista' => $request->id_nutricionista,
                'tipo' => 'INICIAL',
                'fecha' => now(),
                'observaciones' => $request->input('observaciones', ''),
            ]);

            Medicion::create([
                'id_evaluacion' => $evaluacion->id_evaluacion,
                'peso_kg' => $request->input('medicion.peso_kg'),
                'altura_m' => $request->input('medicion.altura_m'),
                'porc_grasa' => $request->input('medicion.porc_grasa'),
                'masa_magra_kg' => $request->input('medicion.masa_magra_kg'),
            ]);

            $servicio = Servicio::findOrFail($request->servicio_id);
            $suscripcion = Suscripcion::create([
                'user_id' => $user->id,
                'servicio_id' => $servicio->id_servicio,
                'estado' => 'activa',
                'fecha_inicio' => now(),
                'fecha_fin' => now()->addDays($servicio->duracion_dias),
                'proximo_cobro' => now()->addDays($servicio->duracion_dias),
                'metodo_pago' => json_encode([
                    'tipo' => 'onboarding',
                    'nombre' => 'Registro',
                ]),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Onboarding completado',
                'evaluacion' => $evaluacion->load('medicion'),
                'suscripcion' => [
                    'id' => $suscripcion->id,
                    'servicio' => [
                        'id' => $servicio->id_servicio,
                        'nombre' => $servicio->nombre,
                        'precio' => (float) $servicio->costo,
                    ],
                    'estado' => $suscripcion->estado,
                    'fecha_inicio' => $suscripcion->fecha_inicio->format('Y-m-d'),
                    'proximo_cobro' => $suscripcion->proximo_cobro->format('Y-m-d'),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al finalizar onboarding',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $email = $request->email;
        $timestamp = now()->toIso8601String();

        // Log inicio de petición de login
        Log::info('Login attempt started', [
            'email' => $email,
            'timestamp' => $timestamp,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                // Log fallo de autenticación
                Log::warning('Login failed - Invalid credentials', [
                    'email' => $email,
                    'timestamp' => $timestamp,
                    'reason' => !$user ? 'user_not_found' : 'invalid_password',
                    'ip' => $request->ip(),
                ]);

                throw ValidationException::withMessages([
                    'email' => ['Las credenciales proporcionadas son incorrectas.'],
                ]);
            }

            // Revocar tokens anteriores
            $user->tokens()->delete();

            // Si es paciente, cargar información adicional
            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $user->id_paciente = $paciente->id_paciente;
                    $user->paciente = $paciente;
                }
            }

            // Generar token
            Log::info('Generating authentication token', [
                'user_id' => $user->id,
                'email' => $email,
                'role' => $user->role,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            // Log login exitoso
            Log::info('Login successful', [
                'user_id' => $user->id,
                'email' => $email,
                'role' => $user->role,
                'timestamp' => $timestamp,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (ValidationException $e) {
            // Re-lanzar ValidationException sin loguear de nuevo
            throw $e;
        } catch (\Exception $e) {
            // Log error inesperado
            Log::error('Login error - Unexpected exception', [
                'email' => $email,
                'timestamp' => $timestamp,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error al procesar la solicitud de inicio de sesión',
            ], 500);
        }
    }

    /**
     * Logout de usuario
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * OAuth Redirect (Google/Facebook)
     */
    public function oauthRedirect(Request $request, $provider)
    {
        $frontendUrl = env('APP_FRONTEND_URL', config('app.url'));
        if ($provider === 'google') {
            $clientId = env('GOOGLE_CLIENT_ID');
            $redirect = env('GOOGLE_REDIRECT_URI', rtrim(config('app.url'), '/') . '/oauth/google/callback');
            $scope = urlencode('openid email profile');
            $url = "https://accounts.google.com/o/oauth2/v2/auth?client_id={$clientId}&redirect_uri=" . urlencode($redirect) . "&response_type=code&scope={$scope}&access_type=offline&prompt=consent";
            return redirect()->away($url);
        }
        if ($provider === 'facebook') {
            $clientId = env('FACEBOOK_CLIENT_ID');
            $redirect = env('FACEBOOK_REDIRECT_URI', rtrim(config('app.url'), '/') . '/oauth/facebook/callback');
            $scope = urlencode('email,public_profile');
            $url = "https://www.facebook.com/v13.0/dialog/oauth?client_id={$clientId}&redirect_uri=" . urlencode($redirect) . "&response_type=code&scope={$scope}";
            return redirect()->away($url);
        }
        return redirect($frontendUrl . '/login');
    }

    /**
     * OAuth Callback (Google/Facebook)
     */
    public function oauthCallback(Request $request, $provider)
    {
        $frontendUrl = env('APP_FRONTEND_URL', config('app.url'));
        try {
            if ($provider === 'google') {
                $clientId = env('GOOGLE_CLIENT_ID');
                $clientSecret = env('GOOGLE_CLIENT_SECRET');
                $redirect = env('GOOGLE_REDIRECT_URI', rtrim(config('app.url'), '/') . '/oauth/google/callback');

                $tokenRes = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'code' => $request->code,
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri' => $redirect,
                    'grant_type' => 'authorization_code',
                ]);
                if (!$tokenRes->successful()) {
                    return redirect($frontendUrl . '/login');
                }
                $accessToken = $tokenRes->json()['access_token'] ?? null;
                $userInfo = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo')->json();
                $email = $userInfo['email'] ?? null;
                $name = $userInfo['name'] ?? ($userInfo['given_name'] ?? 'Usuario Google');
                return $this->completeSocialLogin($email, $name, 'google', $frontendUrl);
            }
            if ($provider === 'facebook') {
                $clientId = env('FACEBOOK_CLIENT_ID');
                $clientSecret = env('FACEBOOK_CLIENT_SECRET');
                $redirect = env('FACEBOOK_REDIRECT_URI', rtrim(config('app.url'), '/') . '/oauth/facebook/callback');

                $tokenRes = Http::get('https://graph.facebook.com/v13.0/oauth/access_token', [
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri' => $redirect,
                    'code' => $request->code,
                ]);
                if (!$tokenRes->successful()) {
                    return redirect($frontendUrl . '/login');
                }
                $accessToken = $tokenRes->json()['access_token'] ?? null;
                $userInfo = Http::get('https://graph.facebook.com/me', [
                    'fields' => 'id,name,email',
                    'access_token' => $accessToken,
                ])->json();
                $email = $userInfo['email'] ?? (Str::uuid() . '@facebook.local');
                $name = $userInfo['name'] ?? 'Usuario Facebook';
                return $this->completeSocialLogin($email, $name, 'facebook', $frontendUrl);
            }
        } catch (\Exception $e) {
            return redirect($frontendUrl . '/login');
        }
        return redirect($frontendUrl . '/login');
    }

    protected function completeSocialLogin($email, $name, $provider, $frontendUrl)
    {
        // Buscar o crear usuario
        $user = User::where('email', $email)->first();
        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(16)),
                'role' => 'paciente',
            ]);

            // Crear paciente
            $nameParts = explode(' ', $name, 2);
            $paciente = Paciente::create([
                'user_id' => $user->id,
                'nombre' => $nameParts[0] ?? $name,
                'apellido' => $nameParts[1] ?? '',
                'fecha_nacimiento' => null,
                'genero' => 'Otro',
                'email' => $email,
                'telefono' => null,
                'peso_inicial' => null,
                'estatura' => null,
                'alergias' => null,
                'id_nutricionista' => null,
            ]);
            $user->id_paciente = $paciente->id_paciente;
            $user->paciente = $paciente;
        } else {
            if ($user->role === 'paciente' && !$user->paciente) {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $user->id_paciente = $paciente->id_paciente;
                    $user->paciente = $paciente;
                }
            }
        }

        // Revocar tokens anteriores y generar nuevo
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirigir al frontend para finalizar onboarding
        $payload = base64_encode(json_encode([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]));
        return redirect($frontendUrl . '/oauth-success?payload=' . $payload);
    }

    /**
     * Login con token de acceso de Google (alternativo para apps móviles)
     */
    public function googleTokenLogin(Request $request)
    {
        $accessToken = $request->input('access_token');
        if (!$accessToken && $request->headers->has('Authorization')) {
            $auth = $request->header('Authorization');
            if (str_starts_with($auth, 'Bearer ')) {
                $accessToken = substr($auth, 7);
            }
        }

        if (!$accessToken) {
            return response()->json(['message' => 'Falta access_token o Authorization Bearer'], 422);
        }

        try {
            $userInfo = Http::withToken($accessToken)
                ->get('https://www.googleapis.com/oauth2/v3/userinfo')
                ->json();

            $email = $userInfo['email'] ?? null;
            $name = $userInfo['name'] ?? ($userInfo['given_name'] ?? 'Usuario Google');
            if (!$email) {
                return response()->json(['message' => 'No se pudo obtener el email del token de Google'], 400);
            }

            $user = User::where('email', $email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'paciente',
                ]);

                $nameParts = explode(' ', $name, 2);
                $paciente = Paciente::create([
                    'user_id' => $user->id,
                    'nombre' => $nameParts[0] ?? $name,
                    'apellido' => $nameParts[1] ?? '',
                    'fecha_nacimiento' => null,
                    'genero' => 'Otro',
                    'email' => $email,
                    'telefono' => null,
                    'peso_inicial' => null,
                    'estatura' => null,
                    'alergias' => null,
                    'id_nutricionista' => null,
                ]);
                $user->id_paciente = $paciente->id_paciente;
                $user->paciente = $paciente;
            } else {
                if ($user->role === 'paciente' && !$user->paciente) {
                    $paciente = Paciente::where('user_id', $user->id)->first();
                    if ($paciente) {
                        $user->id_paciente = $paciente->id_paciente;
                        $user->paciente = $paciente;
                    }
                }
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Inicio de sesión con Google exitoso',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al procesar token de Google',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Endpoint de diagnóstico para verificar configuración de producción
     * GET /api/diagnostic
     */
    public function diagnostic()
    {
        try {
            // Verificar conectividad de base de datos
            $dbConnected = false;
            $dbError = null;
            try {
                DB::connection()->getPdo();
                $dbConnected = true;
            } catch (\Exception $e) {
                $dbError = $e->getMessage();
            }

            // Verificar variables de entorno críticas
            $envVars = [
                'APP_ENV' => env('APP_ENV'),
                'APP_DEBUG' => env('APP_DEBUG'),
                'APP_URL' => env('APP_URL'),
                'SESSION_DRIVER' => env('SESSION_DRIVER'),
                'SESSION_DOMAIN' => env('SESSION_DOMAIN'),
                'SESSION_SECURE_COOKIE' => env('SESSION_SECURE_COOKIE'),
                'SANCTUM_STATEFUL_DOMAINS' => env('SANCTUM_STATEFUL_DOMAINS'),
                'FRONTEND_URL' => env('FRONTEND_URL'),
                'DB_CONNECTION' => env('DB_CONNECTION'),
            ];

            // Verificar configuración de CORS
            $corsConfig = [
                'paths' => config('cors.paths'),
                'supports_credentials' => config('cors.supports_credentials'),
                'allowed_origins_count' => count(config('cors.allowed_origins', [])),
            ];

            // Verificar configuración de Sanctum
            $sanctumDomains = config('sanctum.stateful', []);

            return response()->json([
                'status' => 'ok',
                'timestamp' => now()->toIso8601String(),
                'database' => [
                    'connected' => $dbConnected,
                    'error' => $dbError,
                    'driver' => config('database.default'),
                ],
                'environment' => $envVars,
                'cors' => $corsConfig,
                'sanctum' => [
                    'stateful_domains' => $sanctumDomains,
                    'guard' => config('sanctum.guard'),
                    'expiration' => config('sanctum.expiration'),
                ],
                'session' => [
                    'driver' => config('session.driver'),
                    'lifetime' => config('session.lifetime'),
                    'domain' => config('session.domain'),
                    'secure' => config('session.secure'),
                    'same_site' => config('session.same_site'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener información de diagnóstico',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
