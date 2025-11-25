<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Listar notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        $query = Notification::where('id_usuario', $request->user()->id)
            ->orderBy('created_at', 'desc');

        // Filtrar por leídas/no leídas
        if ($request->has('leida')) {
            $query->where('leida', $request->leida);
        }

        $notificaciones = $query->paginate(20);

        return response()->json($notificaciones);
    }

    /**
     * Crear notificación
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:users,id',
            'tipo' => 'required|in:info,success,warning,error',
            'titulo' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'link' => 'nullable|string'
        ]);

        $notificacion = Notification::create($request->all());

        return response()->json([
            'message' => 'Notificación creada exitosamente',
            'notificacion' => $notificacion
        ], 201);
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead($id)
    {
        $notificacion = Notification::where('id_notificacion', $id)
            ->where('id_usuario', auth()->id())
            ->firstOrFail();

        $notificacion->marcarComoLeida();

        return response()->json([
            'message' => 'Notificación marcada como leída'
        ]);
    }

    /**
     * Marcar todas como leídas
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where('id_usuario', $request->user()->id)
            ->where('leida', false)
            ->update(['leida' => true]);

        return response()->json([
            'message' => 'Todas las notificaciones marcadas como leídas'
        ]);
    }

    /**
     * Contar notificaciones no leídas
     */
    public function countUnread(Request $request)
    {
        try {
            $count = Notification::where('id_usuario', $request->user()->id)
                ->where('leida', false)
                ->count();

            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            // Si hay error (tabla no existe, etc), devolver 0
            return response()->json(['count' => 0]);
        }
    }

    /**
     * Eliminar notificación
     */
    public function destroy($id)
    {
        $notificacion = Notification::where('id_notificacion', $id)
            ->where('id_usuario', auth()->id())
            ->firstOrFail();

        $notificacion->delete();

        return response()->json([
            'message' => 'Notificación eliminada exitosamente'
        ]);
    }
}
