<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;
    public $email;

    /**
     * Create a new notification instance.
     */
    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        // Usar la URL de Laravel (puerto 8000) que sirve la app React
        $url = config('app.url', 'http://localhost:8000') 
            . '/reset-password?token=' . $this->token 
            . '&email=' . urlencode($this->email);

        return (new MailMessage)
            ->subject('Recuperación de Contraseña - NutriSystem')
            ->greeting('¡Hola!')
            ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta.')
            ->line('Haz clic en el botón de abajo para crear una nueva contraseña:')
            ->action('Restablecer Contraseña', $url)
            ->line('Este link expirará en 60 minutos.')
            ->line('Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.')
            ->salutation('Saludos, El equipo de NutriSystem');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'token' => $this->token,
            'email' => $this->email,
        ];
    }
}
