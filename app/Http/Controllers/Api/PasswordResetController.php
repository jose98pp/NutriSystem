<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Solicitar link de recuperación de contraseña
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'No existe una cuenta con este correo electrónico'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Generar token de recuperación
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Te hemos enviado un correo con el link de recuperación'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No pudimos enviar el correo de recuperación'
        ], 500);
    }

    /**
     * Resetear contraseña con token
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Tu contraseña ha sido restablecida exitosamente'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'El token de recuperación es inválido o ha expirado'
        ], 400);
    }

    /**
     * Verificar si un token es válido
     */
    public function verifyToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Verificar si el token existe y no ha expirado
        $tokenData = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$tokenData) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 400);
        }

        // Verificar si el token ha expirado (60 minutos por defecto)
        $createdAt = \Carbon\Carbon::parse($tokenData->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'El token ha expirado'
            ], 400);
        }

        // Verificar el token
        if (!Hash::check($request->token, $tokenData->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token válido'
        ]);
    }
}
