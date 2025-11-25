<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controlador de Mensajes
 * 
 * NOTA: Este controlador es un placeholder para el sistema de mensajes.
 * El modelo Message aún no está implementado, pero las notificaciones
 * están listas para ser integradas cuando se implemente.
 */
class MensajeController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Crear un nuevo mensaje
     * 
     * Cuando se implemente el modelo Message, este método:
     * 1. Creará el mensaje en la base de datos
     * 2. Enviará notificación al destinatario
     * 3. Si es urgente, enviará notificación con prioridad alta
     * 4. Verificará si el destinatario tiene más de 5 mensajes sin leer
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'destinatario_id' => 'required|exists:users,id',
                'asunto' => 'required|string|max:255',
                'contenido' => 'required|string',
                'urgente' => 'boolean'
            ]);

            // TODO: Implementar cuando exista el modelo Message
            // $mensaje = Message::create([
            //     'remitente_id' => $request->user()->id,
            //     'destinatario_id' => $request->destinatario_id,
            //     'asunto' => $request->asunto,
            //     'contenido' => $request->contenido,
            //     'urgente' => $request->urgente ?? false,
            //     'leido' => false
            // ]);

            // Simular mensaje para las notificaciones
            $mensaje = (object) [
                'id' => 1,
                'remitente_id' => $request->user()->id,
                'destinatario_id' => $request->destinatario_id,
                'asunto' => $request->asunto,
                'contenido' => $request->contenido,
                'urgente' => $request->urgente ?? false,
                'leido' => false
            ];

            // Enviar notificación según el tipo de mensaje
            try {
                if ($request->urgente) {
                    // Mensaje urgente
                    $this->notificationService->notificarMensajeUrgente($mensaje);
                } else {
                    // Mensaje normal
                    $this->notificationService->notificarMensajeNuevo($mensaje);
                }

                // Verificar si el destinatario tiene más de 5 mensajes sin leer
                // TODO: Implementar cuando exista el modelo Message
                // $mensajesSinLeer = Message::where('destinatario_id', $request->destinatario_id)
                //     ->where('leido', false)
                //     ->count();
                // 
                // if ($mensajesSinLeer > 5) {
                //     $destinatario = User::find($request->destinatario_id);
                //     $this->notificationService->notificarMensajesAcumulados($destinatario, $mensajesSinLeer);
                // }

            } catch (\Exception $e) {
                Log::error('Error al enviar notificación de mensaje', [
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'message' => 'Mensaje enviado exitosamente (placeholder)',
                'data' => $mensaje
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear mensaje', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al enviar mensaje',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar mensajes del usuario
     */
    public function index(Request $request)
    {
        // TODO: Implementar cuando exista el modelo Message
        return response()->json([
            'message' => 'Sistema de mensajes pendiente de implementación',
            'data' => []
        ]);
    }

    /**
     * Marcar mensaje como leído
     */
    public function marcarLeido($id)
    {
        // TODO: Implementar cuando exista el modelo Message
        return response()->json([
            'message' => 'Sistema de mensajes pendiente de implementación'
        ]);
    }

    /**
     * Contar mensajes sin leer
     */
    public function contarSinLeer(Request $request)
    {
        // TODO: Implementar cuando exista el modelo Message
        return response()->json([
            'count' => 0
        ]);
    }

    /**
     * Verificar y notificar mensajes acumulados
     * Este método puede ser llamado periódicamente o al login
     */
    public function verificarMensajesAcumulados(Request $request)
    {
        try {
            $user = $request->user();

            // TODO: Implementar cuando exista el modelo Message
            // $mensajesSinLeer = Message::where('destinatario_id', $user->id)
            //     ->where('leido', false)
            //     ->count();
            // 
            // if ($mensajesSinLeer > 5) {
            //     $this->notificationService->notificarMensajesAcumulados($user, $mensajesSinLeer);
            // }

            return response()->json([
                'message' => 'Verificación completada (placeholder)',
                'mensajes_sin_leer' => 0
            ]);

        } catch (\Exception $e) {
            Log::error('Error al verificar mensajes acumulados', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al verificar mensajes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
