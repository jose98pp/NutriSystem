<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Listar conversaciones del usuario autenticado
     */
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        // Obtener usuarios con los que ha tenido conversaciones
        $conversations = Message::where('id_remitente', $userId)
            ->orWhere('id_destinatario', $userId)
            ->with(['remitente', 'destinatario'])
            ->get()
            ->map(function ($message) use ($userId) {
                return $message->id_remitente === $userId 
                    ? $message->destinatario 
                    : $message->remitente;
            })
            ->unique('id')
            ->values();

        // Agregar contador de mensajes no leídos por conversación
        $conversations = $conversations->map(function ($user) use ($userId) {
            $unreadCount = Message::where('id_remitente', $user->id)
                ->where('id_destinatario', $userId)
                ->noLeidos()
                ->count();

            $lastMessage = Message::where(function($query) use ($userId, $user) {
                $query->where('id_remitente', $userId)
                      ->where('id_destinatario', $user->id);
            })->orWhere(function($query) use ($userId, $user) {
                $query->where('id_remitente', $user->id)
                      ->where('id_destinatario', $userId);
            })->latest()->first();

            return [
                'usuario' => $user,
                'mensajes_no_leidos' => $unreadCount,
                'ultimo_mensaje' => $lastMessage
            ];
        });

        return response()->json($conversations);
    }

    /**
     * Obtener mensajes de una conversación
     */
    public function getConversation(Request $request, $otherUserId)
    {
        $userId = $request->user()->id;

        $messages = Message::conversacion($userId, $otherUserId);

        // Marcar mensajes recibidos como leídos
        Message::where('id_remitente', $otherUserId)
            ->where('id_destinatario', $userId)
            ->where('leido', false)
            ->update([
                'leido' => true,
                'fecha_lectura' => now()
            ]);

        return response()->json([
            'mensajes' => $messages,
            'otro_usuario' => User::find($otherUserId)
        ]);
    }

    /**
     * Enviar mensaje
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_destinatario' => 'required|exists:users,id',
            'mensaje' => 'required|string|max:1000'
        ]);

        $message = Message::create([
            'id_remitente' => $request->user()->id,
            'id_destinatario' => $request->id_destinatario,
            'mensaje' => $request->mensaje
        ]);

        // Crear notificación para el destinatario
        Notification::create([
            'id_usuario' => $request->id_destinatario,
            'tipo' => 'info',
            'titulo' => 'Nuevo mensaje',
            'mensaje' => 'Has recibido un nuevo mensaje de ' . $request->user()->name,
            'link' => '/mensajes/' . $request->user()->id
        ]);

        return response()->json([
            'message' => 'Mensaje enviado exitosamente',
            'mensaje' => $message->load(['remitente', 'destinatario'])
        ], 201);
    }

    /**
     * Actualizar mensaje
     */
    public function update(Request $request, $id)
    {
        $message = Message::where('id_mensaje', $id)
            ->where('id_remitente', auth()->id())
            ->firstOrFail();

        $request->validate([
            'mensaje' => 'required|string|max:1000'
        ]);

        $message->update([
            'mensaje' => $request->mensaje
        ]);

        return response()->json([
            'message' => 'Mensaje actualizado exitosamente',
            'mensaje' => $message->load(['remitente', 'destinatario'])
        ]);
    }

    /**
     * Eliminar mensaje
     */
    public function destroy($id)
    {
        $message = Message::where('id_mensaje', $id)
            ->where('id_remitente', auth()->id())
            ->firstOrFail();

        $message->delete();

        return response()->json([
            'message' => 'Mensaje eliminado exitosamente'
        ]);
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead($id)
    {
        $message = Message::where('id_mensaje', $id)
            ->where('id_destinatario', auth()->id())
            ->firstOrFail();

        $message->marcarComoLeido();

        return response()->json([
            'message' => 'Mensaje marcado como leído'
        ]);
    }

    /**
     * Contar mensajes no leídos
     */
    public function countUnread(Request $request)
    {
        $count = Message::where('id_destinatario', $request->user()->id)
            ->noLeidos()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Buscar usuarios para iniciar conversación
     */
    public function searchUsers(Request $request)
    {
        $search = $request->get('search', '');
        $userRole = $request->user()->role;

        // Nutricionista puede buscar pacientes, paciente puede buscar nutricionistas
        $query = User::where('id', '!=', $request->user()->id);

        if ($userRole === 'nutricionista') {
            $query->where('role', 'paciente');
        } elseif ($userRole === 'paciente') {
            $query->where('role', 'nutricionista');
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->limit(20)->get();

        return response()->json($users);
    }
}
