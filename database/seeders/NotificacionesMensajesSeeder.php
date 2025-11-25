<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Notification;
use App\Models\Message;
use Carbon\Carbon;

class NotificacionesMensajesSeeder extends Seeder
{
    public function run()
    {
        $pacientes = User::where('role', 'paciente')->get();
        $nutricionista = User::where('email', 'carlos@nutricion.com')->first();

        foreach ($pacientes as $paciente) {
            // Crear notificaciones para el paciente
            $this->crearNotificaciones($paciente);

            // Crear conversación entre nutricionista y paciente
            $this->crearMensajes($paciente, $nutricionista);
        }

        // Notificaciones para el nutricionista
        $this->crearNotificacionesNutricionista($nutricionista);
    }

    private function crearNotificaciones($paciente)
    {
        $notificaciones = [
            [
                'tipo' => 'success',
                'titulo' => '¡Bienvenido al Sistema!',
                'mensaje' => 'Tu cuenta ha sido creada exitosamente. Estamos aquí para ayudarte en tu proceso nutricional.',
                'leida' => true,
                'created_at' => Carbon::now()->subDays(30)
            ],
            [
                'tipo' => 'info',
                'titulo' => 'Plan Nutricional Asignado',
                'mensaje' => 'Se te ha asignado un nuevo plan de alimentación personalizado. Revísalo en la sección de Planes.',
                'link' => '/planes',
                'leida' => true,
                'created_at' => Carbon::now()->subDays(25)
            ],
            [
                'tipo' => 'warning',
                'titulo' => 'Recordatorio: Evaluación Pendiente',
                'mensaje' => 'Es hora de tu evaluación mensual. Por favor, agenda una cita con tu nutricionista.',
                'link' => '/evaluaciones',
                'leida' => rand(0, 1) == 1,
                'created_at' => Carbon::now()->subDays(5)
            ],
            [
                'tipo' => 'success',
                'titulo' => '¡Meta Alcanzada!',
                'mensaje' => '¡Felicidades! Has registrado 7 días consecutivos de ingestas. ¡Sigue así!',
                'leida' => rand(0, 1) == 1,
                'created_at' => Carbon::now()->subDays(3)
            ],
            [
                'tipo' => 'info',
                'titulo' => 'Nuevo Mensaje',
                'mensaje' => 'Tu nutricionista te ha enviado un mensaje. Revisa tu bandeja.',
                'link' => '/mensajes',
                'leida' => false,
                'created_at' => Carbon::now()->subHours(12)
            ],
            [
                'tipo' => 'warning',
                'titulo' => 'Hidratación Importante',
                'mensaje' => 'Recuerda mantener una buena hidratación. Se recomienda 2-3 litros de agua al día.',
                'leida' => false,
                'created_at' => Carbon::now()->subHours(6)
            ]
        ];

        foreach ($notificaciones as $notif) {
            Notification::create([
                'id_usuario' => $paciente->id,
                'tipo' => $notif['tipo'],
                'titulo' => $notif['titulo'],
                'mensaje' => $notif['mensaje'],
                'link' => $notif['link'] ?? null,
                'leida' => $notif['leida'],
                'created_at' => $notif['created_at']
            ]);
        }
    }

    private function crearNotificacionesNutricionista($nutricionista)
    {
        $notificaciones = [
            [
                'tipo' => 'info',
                'titulo' => 'Nuevo Paciente Registrado',
                'mensaje' => 'Se ha registrado un nuevo paciente en el sistema.',
                'link' => '/pacientes',
                'leida' => true,
                'created_at' => Carbon::now()->subDays(7)
            ],
            [
                'tipo' => 'warning',
                'titulo' => 'Evaluaciones Pendientes',
                'mensaje' => 'Tienes 3 evaluaciones programadas para esta semana.',
                'link' => '/evaluaciones',
                'leida' => false,
                'created_at' => Carbon::now()->subHours(24)
            ],
            [
                'tipo' => 'info',
                'titulo' => 'Mensaje de Paciente',
                'mensaje' => 'Juan Pérez te ha enviado un mensaje.',
                'link' => '/mensajes',
                'leida' => false,
                'created_at' => Carbon::now()->subHours(5)
            ],
            [
                'tipo' => 'success',
                'titulo' => 'Plan Completado',
                'mensaje' => 'El plan de Ana Martínez ha sido completado con éxito.',
                'leida' => false,
                'created_at' => Carbon::now()->subHours(2)
            ]
        ];

        foreach ($notificaciones as $notif) {
            Notification::create([
                'id_usuario' => $nutricionista->id,
                'tipo' => $notif['tipo'],
                'titulo' => $notif['titulo'],
                'mensaje' => $notif['mensaje'],
                'link' => $notif['link'] ?? null,
                'leida' => $notif['leida'],
                'created_at' => $notif['created_at']
            ]);
        }
    }

    private function crearMensajes($paciente, $nutricionista)
    {
        $conversaciones = [
            [
                'remitente' => $nutricionista->id,
                'destinatario' => $paciente->id,
                'mensaje' => '¡Hola ' . $paciente->name . '! Bienvenido/a al programa nutricional. Estoy aquí para ayudarte en todo tu proceso.',
                'created_at' => Carbon::now()->subDays(20),
                'leido' => true
            ],
            [
                'remitente' => $paciente->id,
                'destinatario' => $nutricionista->id,
                'mensaje' => '¡Muchas gracias! Estoy muy motivado/a para empezar este cambio.',
                'created_at' => Carbon::now()->subDays(20)->addHours(2),
                'leido' => true
            ],
            [
                'remitente' => $nutricionista->id,
                'destinatario' => $paciente->id,
                'mensaje' => 'Perfecto. He preparado tu plan nutricional personalizado. Revísalo y cualquier duda me comentas.',
                'created_at' => Carbon::now()->subDays(19),
                'leido' => true
            ],
            [
                'remitente' => $paciente->id,
                'destinatario' => $nutricionista->id,
                'mensaje' => 'Ya revisé el plan, se ve muy bien. Tengo una duda sobre las porciones de la cena.',
                'created_at' => Carbon::now()->subDays(18),
                'leido' => true
            ],
            [
                'remitente' => $nutricionista->id,
                'destinatario' => $paciente->id,
                'mensaje' => 'Claro, las porciones son aproximadas. Lo importante es que te sientas satisfecho/a sin excederte. Puedes variar un 10-15%.',
                'created_at' => Carbon::now()->subDays(18)->addHours(3),
                'leido' => true
            ],
            [
                'remitente' => $paciente->id,
                'destinatario' => $nutricionista->id,
                'mensaje' => '¿Cómo va mi progreso? He notado algunos cambios positivos.',
                'created_at' => Carbon::now()->subDays(10),
                'leido' => true
            ],
            [
                'remitente' => $nutricionista->id,
                'destinatario' => $paciente->id,
                'mensaje' => '¡Excelente! Tu progreso es muy bueno. Has perdido peso de forma saludable y tus hábitos han mejorado mucho.',
                'created_at' => Carbon::now()->subDays(10)->addHours(5),
                'leido' => true
            ],
            [
                'remitente' => $paciente->id,
                'destinatario' => $nutricionista->id,
                'mensaje' => 'Hola, tengo una pregunta sobre opciones de snacks saludables para media tarde.',
                'created_at' => Carbon::now()->subDays(3),
                'leido' => true
            ],
            [
                'remitente' => $nutricionista->id,
                'destinatario' => $paciente->id,
                'mensaje' => 'Buenas opciones son: frutos secos (almendras, nueces), yogur griego con frutos rojos, o una fruta con mantequilla de maní.',
                'created_at' => Carbon::now()->subDays(3)->addHours(2),
                'leido' => rand(0, 1) == 1
            ],
            [
                'remitente' => $nutricionista->id,
                'destinatario' => $paciente->id,
                'mensaje' => 'Hola, ¿cómo te sientes con el plan actual? ¿Algún ajuste que necesites?',
                'created_at' => Carbon::now()->subHours(12),
                'leido' => false
            ]
        ];

        foreach ($conversaciones as $msg) {
            Message::create([
                'id_remitente' => $msg['remitente'],
                'id_destinatario' => $msg['destinatario'],
                'mensaje' => $msg['mensaje'],
                'leido' => $msg['leido'],
                'fecha_lectura' => $msg['leido'] ? $msg['created_at']->addMinutes(rand(5, 60)) : null,
                'created_at' => $msg['created_at']
            ]);
        }
    }
}
