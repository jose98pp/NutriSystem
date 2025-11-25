<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sesion;
use App\Services\NotificationService;
use App\Services\ZoomService;
use App\Services\SessionStateManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VideollamadaController extends Controller
{
    protected $notificationService;
    protected $zoomService;
    protected $sessionStateManager;

    public function __construct(
        NotificationService $notificationService,
        ZoomService $zoomService,
        SessionStateManager $sessionStateManager
    ) {
        $this->notificationService = $notificationService;
        $this->zoomService = $zoomService;
        $this->sessionStateManager = $sessionStateManager;
    }

    /**
     * Crear/obtener link de videollamada para una sesión usando Zoom
     */
    public function crear(Request $request)
    {
        $request->validate([
            'id_sesion' => 'required|exists:sesiones,id_sesion'
        ]);

        $sesion = Sesion::findOrFail($request->id_sesion);

        // Verificar que el usuario tiene permiso
        $user = $request->user();
        $tienePermiso = false;

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
        }

        if (!$tienePermiso) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a esta videollamada'
            ], 403);
        }

        // Verificar que la sesión es de tipo videollamada
        if ($sesion->tipo_sesion !== 'VIDEOLLAMADA') {
            return response()->json([
                'message' => 'Esta sesión no es de tipo videollamada'
            ], 400);
        }

        try {
            // Si ya existe una reunión de Zoom, retornar la información existente
            if ($sesion->zoom_meeting_id && $sesion->zoom_join_url) {
                return response()->json([
                    'data' => [
                        'id_sesion' => $sesion->id_sesion,
                        'zoom_meeting_id' => $sesion->zoom_meeting_id,
                        'zoom_join_url' => $sesion->zoom_join_url,
                        'zoom_start_url' => $sesion->zoom_start_url,
                        'fecha_hora' => $sesion->fecha_hora,
                        'duracion_minutos' => $sesion->duracion_minutos,
                        'estado' => $sesion->estado
                    ]
                ]);
            }

            // Crear nueva reunión de Zoom si el servicio está configurado
            if ($this->zoomService->isConfigured()) {
                $meetingData = $this->zoomService->createMeeting([
                    'topic' => "Sesión NutriSystem - {$sesion->id_sesion}",
                    'start_time' => $sesion->fecha_hora->toIso8601String(),
                    'duration' => $sesion->duracion_minutos,
                ]);

                if ($meetingData) {
                    $sesion->update([
                        'zoom_meeting_id' => $meetingData['meeting_id'],
                        'zoom_meeting_password' => $meetingData['meeting_password'],
                        'zoom_join_url' => $meetingData['join_url'],
                        'zoom_start_url' => $meetingData['start_url'],
                    ]);

                    return response()->json([
                        'data' => [
                            'id_sesion' => $sesion->id_sesion,
                            'zoom_meeting_id' => $sesion->zoom_meeting_id,
                            'zoom_join_url' => $sesion->zoom_join_url,
                            'zoom_start_url' => $sesion->zoom_start_url,
                            'fecha_hora' => $sesion->fecha_hora,
                            'duracion_minutos' => $sesion->duracion_minutos,
                            'estado' => $sesion->estado
                        ]
                    ]);
                }

                Log::error('Failed to create Zoom meeting, falling back to Jitsi', [
                    'sesion_id' => $sesion->id_sesion
                ]);
            }

            // Fallback a Jitsi si Zoom no está configurado o falla
            $link = $sesion->generarLinkVideollamada();

            return response()->json([
                'data' => [
                    'id_sesion' => $sesion->id_sesion,
                    'link_videollamada' => $link,
                    'room_name' => basename($link),
                    'fecha_hora' => $sesion->fecha_hora,
                    'duracion_minutos' => $sesion->duracion_minutos,
                    'estado' => $sesion->estado,
                    'using_fallback' => true
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating videollamada', [
                'sesion_id' => $sesion->id_sesion,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al crear videollamada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener token/información para unirse a videollamada
     */
    public function getToken($id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = request()->user();

        // Verificar permisos
        $tienePermiso = false;
        $displayName = '';

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
            $displayName = $user->paciente->nombre . ' ' . $user->paciente->apellido;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
            $displayName = 'Dr. ' . $user->psicologo->nombre . ' ' . $user->psicologo->apellido;
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
            $displayName = 'Nut. ' . $user->nutricionista->nombre . ' ' . $user->nutricionista->apellido;
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
            $displayName = 'Admin';
        }

        if (!$tienePermiso) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a esta videollamada'
            ], 403);
        }

        // Verificar que la sesión está programada o en curso
        if (!in_array($sesion->estado, ['PROGRAMADA', 'EN_CURSO'])) {
            return response()->json([
                'message' => 'Esta sesión no está disponible para videollamada'
            ], 400);
        }

        // Verificar que la sesión es de tipo videollamada
        if ($sesion->tipo_sesion !== 'VIDEOLLAMADA') {
            return response()->json([
                'message' => 'Esta sesión no es de tipo videollamada'
            ], 400);
        }

        $responseData = [
            'display_name' => $displayName,
            'user_role' => $user->role,
            'sesion' => [
                'id' => $sesion->id_sesion,
                'fecha_hora' => $sesion->fecha_hora,
                'duracion_minutos' => $sesion->duracion_minutos,
                'tipo_profesional' => $sesion->tipo_profesional,
                'estado' => $sesion->estado
            ]
        ];

        // Si hay reunión de Zoom, incluir esa información
        if ($sesion->zoom_meeting_id && $sesion->zoom_join_url) {
            $responseData['zoom_meeting_id'] = $sesion->zoom_meeting_id;
            $responseData['zoom_join_url'] = $sesion->zoom_join_url;
            $responseData['zoom_password'] = $sesion->zoom_meeting_password;
        } else {
            // Fallback a Jitsi
            $responseData['room_name'] = basename($sesion->link_videollamada ?? '');
            $responseData['link_videollamada'] = $sesion->link_videollamada;
        }

        return response()->json([
            'data' => $responseData
        ]);
    }

    /**
     * Unirse a una videollamada (paciente)
     */
    public function join(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = $request->user();

        // Verificar permisos
        $tienePermiso = false;

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
        }

        if (!$tienePermiso) {
            return response()->json([
                'message' => 'No tienes permiso para unirte a esta videollamada'
            ], 403);
        }

        // Verificar que la sesión es de tipo videollamada
        if ($sesion->tipo_sesion !== 'VIDEOLLAMADA') {
            return response()->json([
                'message' => 'Esta sesión no es de tipo videollamada'
            ], 400);
        }

        // Verificar que la sesión está disponible
        if (!in_array($sesion->estado, ['PROGRAMADA', 'EN_CURSO'])) {
            return response()->json([
                'message' => 'Esta sesión no está disponible'
            ], 400);
        }

        try {
            // Actualizar estado a EN_CURSO si es paciente uniéndose
            if ($user->role === 'paciente' && $sesion->estado === 'PROGRAMADA') {
                $this->sessionStateManager->updateToInProgress($sesion, $user->id);
            }

            // Retornar información de la videollamada
            $responseData = [
                'id_sesion' => $sesion->id_sesion,
                'estado' => $sesion->fresh()->estado,
            ];

            if ($sesion->zoom_join_url) {
                $responseData['zoom_join_url'] = $sesion->zoom_join_url;
                $responseData['zoom_password'] = $sesion->zoom_meeting_password;
            } else {
                $responseData['link_videollamada'] = $sesion->link_videollamada ?? $sesion->generarLinkVideollamada();
            }

            return response()->json([
                'message' => 'Acceso a videollamada concedido',
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            Log::error('Error joining videollamada', [
                'sesion_id' => $sesion->id_sesion,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al unirse a la videollamada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Finalizar videollamada con limpieza de Zoom
     */
    public function finalizar(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = $request->user();

        // Solo el profesional puede finalizar la sesión
        $puedeFinalizar = false;

        if ($user->role === 'psicologo') {
            $puedeFinalizar = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                              $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $puedeFinalizar = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                              $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $puedeFinalizar = true;
        }

        if (!$puedeFinalizar) {
            return response()->json([
                'message' => 'No tienes permiso para finalizar esta videollamada'
            ], 403);
        }

        $request->validate([
            'notas' => 'nullable|string',
            'confirmado' => 'required|boolean'
        ]);

        // Requerir confirmación
        if (!$request->confirmado) {
            return response()->json([
                'message' => 'Se requiere confirmación para finalizar la sesión'
            ], 400);
        }

        try {
            // Usar SessionStateManager para finalizar correctamente
            $success = $this->sessionStateManager->updateToCompleted(
                $sesion,
                $user->id,
                $request->notas
            );

            if (!$success) {
                return response()->json([
                    'message' => 'No se pudo finalizar la sesión. Verifique el estado actual.'
                ], 400);
            }

            // Enviar notificación de videollamada finalizada
            try {
                $this->notificationService->notificarVideollamadaFinalizada($sesion->fresh());
            } catch (\Exception $e) {
                Log::error('Error al enviar notificación de videollamada finalizada', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'message' => 'Videollamada finalizada exitosamente',
                'data' => $sesion->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error finalizing videollamada', [
                'sesion_id' => $sesion->id_sesion,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al finalizar videollamada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notificar que un participante se unió
     */
    public function participanteUnido(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = $request->user();

        $request->validate([
            'nombre_participante' => 'required|string'
        ]);

        try {
            $this->notificationService->notificarParticipanteUnido($sesion, $request->nombre_participante);

            return response()->json([
                'message' => 'Notificación enviada'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al notificar participante unido', [
                'sesion_id' => $sesion->id_sesion,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al enviar notificación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidad y estado de videollamada con sincronización de Zoom
     */
    public function verificar($id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = request()->user();

        // Verificar permisos
        $tienePermiso = false;

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
        }

        // Sincronizar estado con Zoom si es posible
        if ($sesion->zoom_meeting_id && $this->zoomService->isConfigured()) {
            try {
                $this->sessionStateManager->checkAndUpdateFromZoom($sesion);
                $sesion = $sesion->fresh();
            } catch (\Exception $e) {
                Log::warning('Could not sync session state from Zoom', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $disponible = $tienePermiso && 
                     $sesion->tipo_sesion === 'VIDEOLLAMADA' && 
                     in_array($sesion->estado, ['PROGRAMADA', 'EN_CURSO']);

        // Calcular tiempo hasta la sesión
        $tiempoHastaInicio = null;
        $puedeUnirse = $disponible;

        if ($sesion->fecha_hora) {
            $minutosHastaInicio = now()->diffInMinutes($sesion->fecha_hora, false);
            
            if ($minutosHastaInicio > 0) {
                $tiempoHastaInicio = [
                    'minutos' => $minutosHastaInicio,
                    'texto' => $this->formatearTiempoRestante($minutosHastaInicio)
                ];
                
                // No permitir unirse si faltan más de 15 minutos
                if ($minutosHastaInicio > 15) {
                    $puedeUnirse = false;
                }
            }
        }

        return response()->json([
            'disponible' => $disponible,
            'puede_unirse' => $puedeUnirse,
            'estado' => $sesion->estado,
            'fecha_hora' => $sesion->fecha_hora,
            'tiempo_hasta_inicio' => $tiempoHastaInicio,
            'tiene_zoom' => !empty($sesion->zoom_meeting_id),
            'participante_unido_at' => $sesion->participante_unido_at,
        ]);
    }

    /**
     * Formatear tiempo restante en texto legible
     */
    private function formatearTiempoRestante(int $minutos): string
    {
        if ($minutos < 60) {
            return "{$minutos} minutos";
        }

        $horas = floor($minutos / 60);
        $minutosRestantes = $minutos % 60;

        if ($minutosRestantes === 0) {
            return $horas === 1 ? "1 hora" : "{$horas} horas";
        }

        return $horas === 1 
            ? "1 hora y {$minutosRestantes} minutos"
            : "{$horas} horas y {$minutosRestantes} minutos";
    }
}
