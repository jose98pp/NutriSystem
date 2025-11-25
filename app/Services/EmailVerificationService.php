<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmailVerificationService
{
    /**
     * Enviar email de verificación
     */
    public function sendVerificationEmail(User $user)
    {
        try {
            $verificationUrl = $this->generateVerificationUrl($user);
            
            Mail::send('emails.verify-email', [
                'user' => $user,
                'verificationUrl' => $verificationUrl
            ], function ($message) use ($user) {
                $message->to($user->email, $user->name)
                        ->subject('Verifica tu correo electrónico - NutriSystem');
            });
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Error al enviar email de verificación: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generar URL de verificación
     */
    private function generateVerificationUrl(User $user)
    {
        $baseUrl = config('app.frontend_url', config('app.url'));
        return $baseUrl . '/verify-email?token=' . $user->verification_token . '&email=' . urlencode($user->email);
    }

    /**
     * Verificar token de email
     */
    public function verifyEmail(string $email, string $token)
    {
        $user = User::where('email', $email)
                    ->where('verification_token', $token)
                    ->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Token de verificación inválido'
            ];
        }

        // Verificar si el token ha expirado
        if ($user->verification_expires_at && $user->verification_expires_at->isPast()) {
            return [
                'success' => false,
                'message' => 'El token de verificación ha expirado'
            ];
        }

        // Marcar email como verificado
        $user->email_verified_at = now();
        $user->verification_token = null;
        $user->verification_expires_at = null;
        $user->save();

        return [
            'success' => true,
            'message' => 'Email verificado exitosamente'
        ];
    }

    /**
     * Reenviar email de verificación
     */
    public function resendVerificationEmail(string $email)
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Usuario no encontrado'
            ];
        }

        if ($user->email_verified_at) {
            return [
                'success' => false,
                'message' => 'El email ya está verificado'
            ];
        }

        // Generar nuevo token
        $user->verification_token = Str::random(64);
        $user->verification_expires_at = now()->addHours(24);
        $user->save();

        // Enviar email
        $sent = $this->sendVerificationEmail($user);

        if ($sent) {
            return [
                'success' => true,
                'message' => 'Email de verificación reenviado'
            ];
        }

        return [
            'success' => false,
            'message' => 'Error al enviar el email'
        ];
    }
}
