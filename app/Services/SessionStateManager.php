<?php

namespace App\Services;

use App\Models\Sesion;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SessionStateManager
{
    protected $zoomService;

    public function __construct(ZoomService $zoomService)
    {
        $this->zoomService = $zoomService;
    }

    /**
     * Actualizar sesión a estado EN_CURSO cuando el paciente se une
     * 
     * @param Sesion $sesion Sesión a actualizar
     * @param int $userId ID del usuario que se une
     * @return bool True si se actualizó correctamente
     */
    public function updateToInProgress(Sesion $sesion, int $userId)
    {
        try {
            // Validar que la sesión está en estado PROGRAMADA
            if ($sesion->estado !== 'PROGRAMADA') {
                Log::warning('Attempted to update session to IN_PROGRESS from invalid state', [
                    'sesion_id' => $sesion->id_sesion,
                    'current_state' => $sesion->estado
                ]);
                return false;
            }

            // Actualizar el estado de la sesión
            $sesion->update([
                'estado' => 'EN_CURSO',
                'participante_unido_at' => now(),
            ]);

            Log::info('Session updated to IN_PROGRESS', [
                'sesion_id' => $sesion->id_sesion,
                'user_id' => $userId,
                'joined_at' => now()
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Error updating session to IN_PROGRESS', [
                'sesion_id' => $sesion->id_sesion,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Actualizar sesión a estado COMPLETADA cuando se finaliza
     * 
     * @param Sesion $sesion Sesión a actualizar
     * @param int $userId ID del usuario que finaliza
     * @param string|null $notas Notas post-sesión
     * @return bool True si se actualizó correctamente
     */
    public function updateToCompleted(Sesion $sesion, int $userId, ?string $notas = null)
    {
        try {
            // Validar que la sesión está en estado EN_CURSO o PROGRAMADA
            if (!in_array($sesion->estado, ['EN_CURSO', 'PROGRAMADA'])) {
                Log::warning('Attempted to update session to COMPLETED from invalid state', [
                    'sesion_id' => $sesion->id_sesion,
                    'current_state' => $sesion->estado
                ]);
                return false;
            }

            // Cerrar la reunión de Zoom si existe
            if ($sesion->zoom_meeting_id && $this->zoomService->isConfigured()) {
                $this->zoomService->endMeeting($sesion->zoom_meeting_id);
            }

            // Actualizar el estado de la sesión
            $updateData = [
                'estado' => 'COMPLETADA',
                'finalizada_at' => now(),
                'finalizada_por_user_id' => $userId,
            ];

            if ($notas) {
                $updateData['notas'] = $notas;
            }

            $sesion->update($updateData);

            Log::info('Session updated to COMPLETED', [
                'sesion_id' => $sesion->id_sesion,
                'user_id' => $userId,
                'completed_at' => now()
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Error updating session to COMPLETED', [
                'sesion_id' => $sesion->id_sesion,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Verificar y actualizar el estado de la sesión desde Zoom
     * 
     * @param Sesion $sesion Sesión a verificar
     * @return bool True si se sincronizó correctamente
     */
    public function checkAndUpdateFromZoom(Sesion $sesion)
    {
        try {
            // Si no hay meeting_id de Zoom, no hay nada que sincronizar
            if (!$sesion->zoom_meeting_id) {
                return false;
            }

            // Si el servicio de Zoom no está configurado, no podemos sincronizar
            if (!$this->zoomService->isConfigured()) {
                Log::warning('Zoom service not configured, cannot sync session state', [
                    'sesion_id' => $sesion->id_sesion
                ]);
                return false;
            }

            // Obtener el estado de la reunión desde Zoom
            $zoomStatus = $this->zoomService->getMeetingStatus($sesion->zoom_meeting_id);

            if (!$zoomStatus) {
                Log::warning('Could not get Zoom meeting status', [
                    'sesion_id' => $sesion->id_sesion,
                    'zoom_meeting_id' => $sesion->zoom_meeting_id
                ]);
                return false;
            }

            // Sincronizar el estado basado en el estado de Zoom
            $updated = false;

            // Si la reunión terminó en Zoom pero la sesión sigue EN_CURSO
            if ($zoomStatus === 'finished' && $sesion->estado === 'EN_CURSO') {
                $sesion->update([
                    'estado' => 'COMPLETADA',
                    'finalizada_at' => now(),
                ]);
                $updated = true;

                Log::info('Session auto-completed based on Zoom status', [
                    'sesion_id' => $sesion->id_sesion,
                    'zoom_status' => $zoomStatus
                ]);
            }

            // Si la reunión comenzó en Zoom pero la sesión sigue PROGRAMADA
            if ($zoomStatus === 'started' && $sesion->estado === 'PROGRAMADA') {
                $sesion->update([
                    'estado' => 'EN_CURSO',
                    'participante_unido_at' => now(),
                ]);
                $updated = true;

                Log::info('Session auto-started based on Zoom status', [
                    'sesion_id' => $sesion->id_sesion,
                    'zoom_status' => $zoomStatus
                ]);
            }

            return $updated;

        } catch (\Exception $e) {
            Log::error('Error syncing session state from Zoom', [
                'sesion_id' => $sesion->id_sesion,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Validar si una transición de estado es válida
     * 
     * @param string $fromState Estado actual
     * @param string $toState Estado destino
     * @return bool True si la transición es válida
     */
    public function isValidTransition(string $fromState, string $toState): bool
    {
        $validTransitions = [
            'PROGRAMADA' => ['EN_CURSO', 'CANCELADA', 'COMPLETADA'],
            'EN_CURSO' => ['COMPLETADA', 'CANCELADA'],
            'COMPLETADA' => [], // No se puede cambiar desde COMPLETADA
            'CANCELADA' => [], // No se puede cambiar desde CANCELADA
        ];

        return in_array($toState, $validTransitions[$fromState] ?? []);
    }

    /**
     * Cerrar sesiones inactivas (más de 30 minutos sin actividad)
     * 
     * @return int Número de sesiones cerradas
     */
    public function closeInactiveSessions(): int
    {
        try {
            $inactiveThreshold = now()->subMinutes(30);
            
            // Buscar sesiones EN_CURSO que no han tenido actividad en 30 minutos
            $inactiveSessions = Sesion::where('estado', 'EN_CURSO')
                ->where(function ($query) use ($inactiveThreshold) {
                    $query->where('participante_unido_at', '<', $inactiveThreshold)
                          ->orWhere(function ($q) use ($inactiveThreshold) {
                              $q->whereNull('participante_unido_at')
                                ->where('fecha_hora', '<', $inactiveThreshold);
                          });
                })
                ->get();

            $closedCount = 0;

            foreach ($inactiveSessions as $sesion) {
                // Cerrar la reunión de Zoom si existe
                if ($sesion->zoom_meeting_id && $this->zoomService->isConfigured()) {
                    $this->zoomService->endMeeting($sesion->zoom_meeting_id);
                }

                // Actualizar el estado de la sesión
                $sesion->update([
                    'estado' => 'COMPLETADA',
                    'finalizada_at' => now(),
                    'notas' => ($sesion->notas ?? '') . "\n[Auto-cerrada por inactividad]",
                ]);

                $closedCount++;

                Log::info('Inactive session auto-closed', [
                    'sesion_id' => $sesion->id_sesion,
                    'inactive_since' => $sesion->participante_unido_at ?? $sesion->fecha_hora
                ]);
            }

            if ($closedCount > 0) {
                Log::info('Closed inactive sessions', [
                    'count' => $closedCount
                ]);
            }

            return $closedCount;

        } catch (\Exception $e) {
            Log::error('Error closing inactive sessions', [
                'error' => $e->getMessage()
            ]);

            return 0;
        }
    }
}
