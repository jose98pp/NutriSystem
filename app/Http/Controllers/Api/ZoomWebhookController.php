<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sesion;
use App\Services\SessionStateManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZoomWebhookController extends Controller
{
    protected $sessionStateManager;

    public function __construct(SessionStateManager $sessionStateManager)
    {
        $this->sessionStateManager = $sessionStateManager;
    }

    /**
     * Manejar webhooks de Zoom
     */
    public function handle(Request $request)
    {
        try {
            // Validar la firma del webhook de Zoom
            if (!$this->validateZoomSignature($request)) {
                Log::warning('Invalid Zoom webhook signature', [
                    'ip' => $request->ip(),
                    'headers' => $request->headers->all()
                ]);

                return response()->json([
                    'message' => 'Invalid signature'
                ], 401);
            }

            $payload = $request->all();
            $event = $payload['event'] ?? null;

            Log::info('Zoom webhook received', [
                'event' => $event,
                'payload' => $payload
            ]);

            // Procesar según el tipo de evento
            switch ($event) {
                case 'meeting.started':
                    return $this->handleMeetingStarted($payload);

                case 'meeting.ended':
                    return $this->handleMeetingEnded($payload);

                case 'meeting.participant_joined':
                    return $this->handleParticipantJoined($payload);

                case 'meeting.participant_left':
                    return $this->handleParticipantLeft($payload);

                default:
                    Log::info('Unhandled Zoom webhook event', [
                        'event' => $event
                    ]);
                    
                    return response()->json([
                        'message' => 'Event received but not processed'
                    ]);
            }

        } catch (\Exception $e) {
            Log::error('Error processing Zoom webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error processing webhook',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manejar evento de reunión iniciada
     */
    protected function handleMeetingStarted(array $payload)
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;

        if (!$meetingId) {
            return response()->json(['message' => 'Missing meeting ID']);
        }

        $sesion = Sesion::where('zoom_meeting_id', $meetingId)->first();

        if (!$sesion) {
            Log::warning('Session not found for Zoom meeting', [
                'meeting_id' => $meetingId
            ]);
            return response()->json(['message' => 'Session not found']);
        }

        // Actualizar estado a EN_CURSO si está PROGRAMADA
        if ($sesion->estado === 'PROGRAMADA') {
            $sesion->update([
                'estado' => 'EN_CURSO',
                'participante_unido_at' => now(),
            ]);

            Log::info('Session auto-started from Zoom webhook', [
                'sesion_id' => $sesion->id_sesion,
                'meeting_id' => $meetingId
            ]);
        }

        return response()->json(['message' => 'Meeting started event processed']);
    }

    /**
     * Manejar evento de reunión finalizada
     */
    protected function handleMeetingEnded(array $payload)
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;

        if (!$meetingId) {
            return response()->json(['message' => 'Missing meeting ID']);
        }

        $sesion = Sesion::where('zoom_meeting_id', $meetingId)->first();

        if (!$sesion) {
            Log::warning('Session not found for Zoom meeting', [
                'meeting_id' => $meetingId
            ]);
            return response()->json(['message' => 'Session not found']);
        }

        // Actualizar estado a COMPLETADA si está EN_CURSO
        if (in_array($sesion->estado, ['EN_CURSO', 'PROGRAMADA'])) {
            $sesion->update([
                'estado' => 'COMPLETADA',
                'finalizada_at' => now(),
            ]);

            Log::info('Session auto-completed from Zoom webhook', [
                'sesion_id' => $sesion->id_sesion,
                'meeting_id' => $meetingId
            ]);
        }

        return response()->json(['message' => 'Meeting ended event processed']);
    }

    /**
     * Manejar evento de participante unido
     */
    protected function handleParticipantJoined(array $payload)
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;
        $participantName = $payload['payload']['object']['participant']['user_name'] ?? 'Unknown';

        if (!$meetingId) {
            return response()->json(['message' => 'Missing meeting ID']);
        }

        $sesion = Sesion::where('zoom_meeting_id', $meetingId)->first();

        if (!$sesion) {
            Log::warning('Session not found for Zoom meeting', [
                'meeting_id' => $meetingId
            ]);
            return response()->json(['message' => 'Session not found']);
        }

        // Actualizar estado a EN_CURSO si es el primer participante
        if ($sesion->estado === 'PROGRAMADA' && !$sesion->participante_unido_at) {
            $sesion->update([
                'estado' => 'EN_CURSO',
                'participante_unido_at' => now(),
            ]);
        }

        Log::info('Participant joined Zoom meeting', [
            'sesion_id' => $sesion->id_sesion,
            'meeting_id' => $meetingId,
            'participant' => $participantName
        ]);

        return response()->json(['message' => 'Participant joined event processed']);
    }

    /**
     * Manejar evento de participante salió
     */
    protected function handleParticipantLeft(array $payload)
    {
        $meetingId = $payload['payload']['object']['id'] ?? null;
        $participantName = $payload['payload']['object']['participant']['user_name'] ?? 'Unknown';

        if (!$meetingId) {
            return response()->json(['message' => 'Missing meeting ID']);
        }

        Log::info('Participant left Zoom meeting', [
            'meeting_id' => $meetingId,
            'participant' => $participantName
        ]);

        return response()->json(['message' => 'Participant left event processed']);
    }

    /**
     * Validar la firma del webhook de Zoom
     */
    protected function validateZoomSignature(Request $request): bool
    {
        // Si no hay secret configurado, permitir el webhook (modo desarrollo)
        $webhookSecret = config('services.zoom.webhook_secret');
        
        if (!$webhookSecret) {
            Log::warning('Zoom webhook secret not configured, skipping validation');
            return true;
        }

        // Obtener la firma del header
        $signature = $request->header('x-zm-signature');
        
        if (!$signature) {
            return false;
        }

        // Obtener el timestamp
        $timestamp = $request->header('x-zm-request-timestamp');
        
        if (!$timestamp) {
            return false;
        }

        // Verificar que el timestamp no sea muy antiguo (5 minutos)
        if (abs(time() - $timestamp) > 300) {
            Log::warning('Zoom webhook timestamp too old', [
                'timestamp' => $timestamp,
                'current_time' => time()
            ]);
            return false;
        }

        // Construir el mensaje para validar
        $message = 'v0:' . $timestamp . ':' . $request->getContent();
        
        // Calcular la firma esperada
        $expectedSignature = 'v0=' . hash_hmac('sha256', $message, $webhookSecret);

        // Comparar las firmas
        return hash_equals($expectedSignature, $signature);
    }
}
