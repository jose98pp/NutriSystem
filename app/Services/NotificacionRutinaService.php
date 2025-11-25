<?php

namespace App\Services;

use App\Models\RutinaPaciente;
use App\Services\NotificationService;
use Carbon\Carbon;

class NotificacionRutinaService
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function programarRecordatorios($rutinaPacienteId)
    {
        $rutinaPaciente = RutinaPaciente::with(['paciente.user', 'rutina'])->findOrFail($rutinaPacienteId);

        // Los recordatorios se manejarán mediante comandos programados
        // Este método podría usarse para configurar preferencias específicas
        
        return true;
    }

    public function enviarRecordatorioSesion($rutinaPacienteId)
    {
        $rutinaPaciente = RutinaPaciente::with(['paciente.user', 'rutina'])->findOrFail($rutinaPacienteId);

        if (!$rutinaPaciente->activa || !$rutinaPaciente->esVigente()) {
            return false;
        }

        $user = $rutinaPaciente->paciente->user;
        
        $this->notificationService->enviarNotificacion(
            $user->id,
            'recordatorio_entrenamiento',
            '¡Hora de entrenar! 💪',
            "Tu rutina '{$rutinaPaciente->rutina->nombre}' te espera",
            [
                'rutina_paciente_id' => $rutinaPaciente->id,
                'rutina_id' => $rutinaPaciente->rutina_id,
                'action_url' => '/rutinas/' . $rutinaPaciente->id . '/iniciar',
            ]
        );

        return true;
    }

    public function enviarMotivacion($pacienteId)
    {
        $paciente = \App\Models\Paciente::with('user')->findOrFail($pacienteId);

        // Verificar última sesión
        $ultimaSesion = \App\Models\SesionEntrenamiento::porPaciente($pacienteId)
            ->completadas()
            ->orderBy('fecha', 'desc')
            ->first();

        if (!$ultimaSesion || $ultimaSesion->fecha->diffInDays(Carbon::now()) >= 7) {
            $this->notificationService->enviarNotificacion(
                $paciente->user->id,
                'motivacion_entrenamiento',
                '¡Te extrañamos! 🏃‍♂️',
                'Han pasado varios días sin entrenar. ¡Retoma tu rutina hoy!',
                [
                    'action_url' => '/rutinas',
                ]
            );

            return true;
        }

        return false;
    }

    public function cancelarRecordatorios($rutinaPacienteId)
    {
        // Marcar la rutina como inactiva
        $rutinaPaciente = RutinaPaciente::findOrFail($rutinaPacienteId);
        $rutinaPaciente->activa = false;
        $rutinaPaciente->save();

        return true;
    }

    public function enviarResumenSemanal($pacienteId)
    {
        $paciente = \App\Models\Paciente::with('user')->findOrFail($pacienteId);
        $progresoService = new ProgresoService();
        
        $reporte = $progresoService->generarReporteSemanal($pacienteId);

        $mensaje = sprintf(
            "Esta semana completaste %d de %d sesiones. ¡Sigue así! 🎯",
            $reporte['resumen']['sesiones_completadas'],
            $reporte['resumen']['sesiones_programadas']
        );

        $this->notificationService->enviarNotificacion(
            $paciente->user->id,
            'resumen_semanal_entrenamiento',
            'Resumen de tu semana 📊',
            $mensaje,
            [
                'reporte' => $reporte,
                'action_url' => '/progreso',
            ]
        );

        return true;
    }
}
