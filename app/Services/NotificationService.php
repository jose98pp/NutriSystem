<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Sesion;
use App\Models\Ingesta;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Models\CalendarioEntrega;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Exception;

class NotificationService
{
    /**
     * Crear notificación genérica
     * 
     * @param int $userId ID del usuario que recibirá la notificación
     * @param string $tipo Tipo de notificación: info, success, warning, error
     * @param string $titulo Título de la notificación
     * @param string $mensaje Mensaje de la notificación
     * @param string|null $link Link opcional para redirección
     * @return Notification|null
     */
    public function create(int $userId, string $tipo, string $titulo, string $mensaje, ?string $link = null): ?Notification
    {
        try {
            // Validar que el usuario existe
            $user = User::find($userId);
            if (!$user) {
                Log::warning("NotificationService: Usuario no encontrado", ['user_id' => $userId]);
                return null;
            }

            // Validar tipo
            if (!in_array($tipo, ['info', 'success', 'warning', 'error'])) {
                Log::warning("NotificationService: Tipo de notificación inválido", ['tipo' => $tipo]);
                $tipo = 'info';
            }

            // Crear notificación
            $notification = Notification::create([
                'id_usuario' => $userId,
                'tipo' => $tipo,
                'titulo' => $titulo,
                'mensaje' => $mensaje,
                'leida' => false,
                'link' => $link
            ]);

            Log::info("NotificationService: Notificación creada", [
                'notification_id' => $notification->id_notificacion,
                'user_id' => $userId,
                'tipo' => $tipo
            ]);

            return $notification;
        } catch (Exception $e) {
            Log::error("NotificationService: Error al crear notificación", [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);
            return null;
        }
    }

    // ==================== NOTIFICACIONES DE SESIONES ====================

    /**
     * Notificar cuando se crea una sesión
     */
    public function notificarSesionCreada(Sesion $sesion): void
    {
        try {
            $paciente = $sesion->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $fechaHora = $sesion->fecha_hora->format('d/m/Y H:i');
            $tipoProfesional = ucfirst(strtolower($sesion->tipo_profesional));
            
            $this->create(
                $paciente->user_id,
                'info',
                'Nueva Sesión Programada',
                "Se ha programado una sesión de {$tipoProfesional} para el {$fechaHora}.",
                "/mis-sesiones"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar sesión creada", [
                'error' => $e->getMessage(),
                'sesion_id' => $sesion->id_sesion
            ]);
        }
    }

    /**
     * Notificar sesión próxima (24h o 1h antes)
     */
    public function notificarSesionProxima(Sesion $sesion, int $horasAntes): void
    {
        try {
            $paciente = $sesion->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $fechaHora = $sesion->fecha_hora->format('d/m/Y H:i');
            $tipoProfesional = ucfirst(strtolower($sesion->tipo_profesional));
            
            $titulo = $horasAntes === 24 
                ? 'Recordatorio: Sesión Mañana' 
                : 'Recordatorio: Sesión en 1 Hora';
            
            $mensaje = $horasAntes === 24
                ? "Recuerda que mañana tienes una sesión de {$tipoProfesional} a las {$sesion->fecha_hora->format('H:i')}."
                : "Tu sesión de {$tipoProfesional} comienza en 1 hora ({$sesion->fecha_hora->format('H:i')}).";

            $tipo = $horasAntes === 1 ? 'warning' : 'info';

            $this->create(
                $paciente->user_id,
                $tipo,
                $titulo,
                $mensaje,
                "/mis-sesiones"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar sesión próxima", [
                'error' => $e->getMessage(),
                'sesion_id' => $sesion->id_sesion
            ]);
        }
    }

    /**
     * Notificar cuando se cancela una sesión
     */
    public function notificarSesionCancelada(Sesion $sesion): void
    {
        try {
            $paciente = $sesion->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $fechaHora = $sesion->fecha_hora->format('d/m/Y H:i');
            $tipoProfesional = ucfirst(strtolower($sesion->tipo_profesional));
            
            $this->create(
                $paciente->user_id,
                'warning',
                'Sesión Cancelada',
                "Tu sesión de {$tipoProfesional} del {$fechaHora} ha sido cancelada.",
                "/mis-sesiones"
            );

            // Notificar también al profesional si tiene user_id
            $profesional = $sesion->profesional();
            if ($profesional && method_exists($profesional, 'first')) {
                $prof = $profesional->first();
                if ($prof && isset($prof->user_id)) {
                    $this->create(
                        $prof->user_id,
                        'info',
                        'Sesión Cancelada',
                        "La sesión con {$paciente->nombre} {$paciente->apellido} del {$fechaHora} ha sido cancelada.",
                        "/sesiones"
                    );
                }
            }
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar sesión cancelada", [
                'error' => $e->getMessage(),
                'sesion_id' => $sesion->id_sesion
            ]);
        }
    }

    /**
     * Notificar cuando se reprograma una sesión
     */
    public function notificarSesionReprogramada(Sesion $sesion, $fechaAnterior): void
    {
        try {
            $paciente = $sesion->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $fechaHoraNueva = $sesion->fecha_hora->format('d/m/Y H:i');
            $tipoProfesional = ucfirst(strtolower($sesion->tipo_profesional));
            
            $this->create(
                $paciente->user_id,
                'info',
                'Sesión Reprogramada',
                "Tu sesión de {$tipoProfesional} ha sido reprogramada para el {$fechaHoraNueva}.",
                "/mis-sesiones"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar sesión reprogramada", [
                'error' => $e->getMessage(),
                'sesion_id' => $sesion->id_sesion
            ]);
        }
    }

    // ==================== NOTIFICACIONES DE VIDEOLLAMADAS ====================

    /**
     * Notificar cuando se inicia una videollamada
     */
    public function notificarVideollamadaIniciada(Sesion $videollamada): void
    {
        try {
            $paciente = $videollamada->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $link = $videollamada->link_videollamada ?? $videollamada->generarLinkVideollamada();
            
            $this->create(
                $paciente->user_id,
                'success',
                'Videollamada Iniciada',
                "Tu videollamada ha comenzado. Haz clic aquí para unirte.",
                $link
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar videollamada iniciada", [
                'error' => $e->getMessage(),
                'sesion_id' => $videollamada->id_sesion
            ]);
        }
    }

    /**
     * Notificar videollamada próxima (5 minutos antes)
     */
    public function notificarVideollamadaProxima(Sesion $videollamada): void
    {
        try {
            $paciente = $videollamada->paciente;
            if ($paciente && $paciente->user_id) {
                $link = $videollamada->link_videollamada ?? $videollamada->generarLinkVideollamada();
                
                $this->create(
                    $paciente->user_id,
                    'warning',
                    'Videollamada en 5 Minutos',
                    "Tu videollamada comienza en 5 minutos. Prepárate para unirte.",
                    $link
                );
            }

            // Notificar al profesional
            $profesional = $videollamada->profesional();
            if ($profesional && method_exists($profesional, 'first')) {
                $prof = $profesional->first();
                if ($prof && isset($prof->user_id)) {
                    $link = $videollamada->link_videollamada ?? $videollamada->generarLinkVideollamada();
                    
                    $this->create(
                        $prof->user_id,
                        'warning',
                        'Videollamada en 5 Minutos',
                        "Tu videollamada con {$paciente->nombre} {$paciente->apellido} comienza en 5 minutos.",
                        $link
                    );
                }
            }
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar videollamada próxima", [
                'error' => $e->getMessage(),
                'sesion_id' => $videollamada->id_sesion
            ]);
        }
    }

    /**
     * Notificar cuando un participante se une a la videollamada
     */
    public function notificarParticipanteUnido(Sesion $videollamada, string $nombreParticipante): void
    {
        try {
            $paciente = $videollamada->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $this->create(
                $paciente->user_id,
                'info',
                'Participante Unido',
                "{$nombreParticipante} se ha unido a la videollamada.",
                $videollamada->link_videollamada
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar participante unido", [
                'error' => $e->getMessage(),
                'sesion_id' => $videollamada->id_sesion
            ]);
        }
    }

    /**
     * Notificar cuando finaliza una videollamada
     */
    public function notificarVideollamadaFinalizada(Sesion $videollamada): void
    {
        try {
            $paciente = $videollamada->paciente;
            if ($paciente && $paciente->user_id) {
                $this->create(
                    $paciente->user_id,
                    'success',
                    'Videollamada Finalizada',
                    "Tu videollamada ha finalizado. Gracias por tu participación.",
                    "/mis-sesiones"
                );
            }

            // Notificar al profesional
            $profesional = $videollamada->profesional();
            if ($profesional && method_exists($profesional, 'first')) {
                $prof = $profesional->first();
                if ($prof && isset($prof->user_id)) {
                    $this->create(
                        $prof->user_id,
                        'info',
                        'Videollamada Finalizada',
                        "La videollamada con {$paciente->nombre} {$paciente->apellido} ha finalizado.",
                        "/sesiones"
                    );
                }
            }
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar videollamada finalizada", [
                'error' => $e->getMessage(),
                'sesion_id' => $videollamada->id_sesion
            ]);
        }
    }

    // ==================== NOTIFICACIONES DE MENSAJES ====================

    /**
     * Notificar nuevo mensaje
     * Nota: El modelo Message no existe aún, se implementará cuando esté disponible
     */
    public function notificarMensajeNuevo($mensaje): void
    {
        try {
            // Placeholder para cuando se implemente el sistema de mensajes
            // $destinatario = $mensaje->destinatario;
            // $remitente = $mensaje->remitente;
            // 
            // $this->create(
            //     $destinatario->id,
            //     'info',
            //     'Nuevo Mensaje',
            //     "Tienes un nuevo mensaje de {$remitente->name}",
            //     "/mensajes"
            // );
            
            Log::info("NotificationService: notificarMensajeNuevo llamado (pendiente implementación de modelo Message)");
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar mensaje nuevo", [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notificar mensajes acumulados (más de 5 sin leer)
     */
    public function notificarMensajesAcumulados(User $usuario, int $cantidad): void
    {
        try {
            $this->create(
                $usuario->id,
                'warning',
                'Mensajes Sin Leer',
                "Tienes {$cantidad} mensajes sin leer. Revisa tu bandeja de entrada.",
                "/mensajes"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar mensajes acumulados", [
                'error' => $e->getMessage(),
                'user_id' => $usuario->id
            ]);
        }
    }

    /**
     * Notificar mensaje urgente
     */
    public function notificarMensajeUrgente($mensaje): void
    {
        try {
            // Placeholder para cuando se implemente el sistema de mensajes
            // $destinatario = $mensaje->destinatario;
            // $remitente = $mensaje->remitente;
            // 
            // $this->create(
            //     $destinatario->id,
            //     'error',
            //     '¡Mensaje Urgente!',
            //     "Tienes un mensaje urgente de {$remitente->name}",
            //     "/mensajes"
            // );
            
            Log::info("NotificationService: notificarMensajeUrgente llamado (pendiente implementación de modelo Message)");
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar mensaje urgente", [
                'error' => $e->getMessage()
            ]);
        }
    }

    // ==================== NOTIFICACIONES DE COMIDAS ====================

    /**
     * Notificar comida programada
     */
    public function notificarComidaProgramada(PlanDia $planDia, Comida $comida, Paciente $paciente): void
    {
        try {
            if (!$paciente->user_id) {
                return;
            }

            $tipoComida = ucfirst(strtolower($comida->tipo_comida));
            $hora = $comida->hora_recomendada;
            
            $this->create(
                $paciente->user_id,
                'info',
                "Hora de {$tipoComida}",
                "Es hora de tu {$tipoComida}. {$comida->nombre}",
                "/mis-comidas-hoy"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar comida programada", [
                'error' => $e->getMessage(),
                'comida_id' => $comida->id_comida
            ]);
        }
    }

    /**
     * Notificar comida omitida
     */
    public function notificarComidaOmitida(PlanDia $planDia, Comida $comida, Paciente $paciente): void
    {
        try {
            if (!$paciente->user_id) {
                return;
            }

            $tipoComida = ucfirst(strtolower($comida->tipo_comida));
            
            $this->create(
                $paciente->user_id,
                'warning',
                'Comida Pendiente',
                "No has registrado tu {$tipoComida}. ¿Ya comiste?",
                "/mis-comidas-hoy"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar comida omitida", [
                'error' => $e->getMessage(),
                'comida_id' => $comida->id_comida
            ]);
        }
    }

    /**
     * Notificar ingesta registrada
     */
    public function notificarIngestaRegistrada(Ingesta $ingesta): void
    {
        try {
            $paciente = $ingesta->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $tipoComida = ucfirst(strtolower($ingesta->tipo_comida));
            
            $this->create(
                $paciente->user_id,
                'success',
                '¡Ingesta Registrada!',
                "Has registrado tu {$tipoComida} exitosamente. ¡Sigue así!",
                "/ingestas"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar ingesta registrada", [
                'error' => $e->getMessage(),
                'ingesta_id' => $ingesta->id_ingesta
            ]);
        }
    }

    /**
     * Notificar al nutricionista sobre comidas omitidas consecutivas
     */
    public function notificarComidasOmitidasConsecutivas(Paciente $paciente, int $cantidad): void
    {
        try {
            $nutricionista = $paciente->nutricionista;
            if (!$nutricionista || !$nutricionista->user_id) {
                return;
            }

            $this->create(
                $nutricionista->user_id,
                'warning',
                'Alerta: Comidas Omitidas',
                "{$paciente->nombre} {$paciente->apellido} ha omitido {$cantidad} comidas consecutivas.",
                "/pacientes/{$paciente->id_paciente}"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar comidas omitidas consecutivas", [
                'error' => $e->getMessage(),
                'paciente_id' => $paciente->id_paciente
            ]);
        }
    }

    // ==================== NOTIFICACIONES DE MENÚ ====================

    /**
     * Notificar menú diario
     */
    public function notificarMenuDiario(PlanAlimentacion $plan, PlanDia $planDia): void
    {
        try {
            $paciente = $plan->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $comidas = $planDia->comidas;
            $tiposComida = $comidas->pluck('tipo_comida')->map(function($tipo) {
                return ucfirst(strtolower($tipo));
            })->implode(', ');

            $fecha = $planDia->fecha ? $planDia->fecha->format('d/m/Y') : 'hoy';
            
            $this->create(
                $paciente->user_id,
                'info',
                'Tu Menú de Hoy',
                "Tu menú para {$fecha} está listo: {$tiposComida}",
                "/mi-menu-semanal"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar menú diario", [
                'error' => $e->getMessage(),
                'plan_id' => $plan->id_plan
            ]);
        }
    }

    /**
     * Notificar menú modificado
     */
    public function notificarMenuModificado(PlanDia $planDia): void
    {
        try {
            $plan = $planDia->plan;
            if (!$plan) {
                return;
            }

            $paciente = $plan->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $fecha = $planDia->fecha ? $planDia->fecha->format('d/m/Y') : 'del día';
            
            $this->create(
                $paciente->user_id,
                'warning',
                'Menú Actualizado',
                "Tu menú {$fecha} ha sido modificado por tu nutricionista.",
                "/mi-menu-semanal"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar menú modificado", [
                'error' => $e->getMessage(),
                'plan_dia_id' => $planDia->id_dia
            ]);
        }
    }

    /**
     * Notificar entrega próxima
     */
    public function notificarEntregaProxima(CalendarioEntrega $entrega): void
    {
        try {
            $contrato = $entrega->contrato;
            if (!$contrato) {
                return;
            }

            $paciente = $contrato->paciente;
            if (!$paciente || !$paciente->user_id) {
                return;
            }

            $fechaInicio = $entrega->fecha_inicio->format('d/m/Y');
            
            $this->create(
                $paciente->user_id,
                'info',
                'Entrega Próxima',
                "Tu entrega de menú está programada para mañana ({$fechaInicio}).",
                "/mis-entregas"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar entrega próxima", [
                'error' => $e->getMessage(),
                'calendario_id' => $entrega->id_calendario
            ]);
        }
    }

    /**
     * Notificar al nutricionista sobre ingesta fuera de horario
     */
    public function notificarIngestaFueraHorario(Ingesta $ingesta, Paciente $paciente): void
    {
        try {
            $nutricionista = $paciente->nutricionista;
            if (!$nutricionista || !$nutricionista->user_id) {
                return;
            }

            $tipoComida = ucfirst(strtolower($ingesta->tipo_comida));
            $hora = $ingesta->fecha_hora->format('H:i');
            
            $this->create(
                $nutricionista->user_id,
                'info',
                'Ingesta Fuera de Horario',
                "{$paciente->nombre} {$paciente->apellido} registró {$tipoComida} a las {$hora} (fuera del horario programado).",
                "/pacientes/{$paciente->id_paciente}"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar ingesta fuera de horario", [
                'error' => $e->getMessage(),
                'ingesta_id' => $ingesta->id_ingesta
            ]);
        }
    }

    /**
     * Notificar al nutricionista sobre inactividad del paciente (24h sin ingestas)
     */
    public function notificarPacienteInactivo(Paciente $paciente): void
    {
        try {
            $nutricionista = $paciente->nutricionista;
            if (!$nutricionista || !$nutricionista->user_id) {
                return;
            }

            $this->create(
                $nutricionista->user_id,
                'warning',
                'Alerta: Paciente Inactivo',
                "{$paciente->nombre} {$paciente->apellido} no ha registrado ingestas en las últimas 24 horas.",
                "/pacientes/{$paciente->id_paciente}"
            );
        } catch (Exception $e) {
            Log::error("NotificationService: Error al notificar paciente inactivo", [
                'error' => $e->getMessage(),
                'paciente_id' => $paciente->id_paciente
            ]);
        }
    }
}
