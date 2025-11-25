<?php

namespace App\Http\Controllers\Api;

use App\Events\UserOffline;
use App\Events\UserOnline;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\UserPresence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PresenceController extends Controller
{
    /**
     * Update user online status.
     */
    public function updateStatus(Request $request)
    {
        $request->validate([
            'status' => 'required|in:online,offline,away',
            'socket_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $status = $request->input('status');

        $presence = UserPresence::updateOrCreate(
            ['user_id' => $user->id],
            [
                'status' => $status,
                'last_seen_at' => now(),
                'socket_id' => $request->input('socket_id'),
            ]
        );

        // Broadcast event
        if ($status === 'online') {
            broadcast(new UserOnline($user))->toOthers();
        } elseif ($status === 'offline') {
            broadcast(new UserOffline($user, now()))->toOthers();
        }

        return response()->json([
            'message' => 'Estado actualizado',
            'presence' => $presence,
        ]);
    }

    /**
     * Get presence status for multiple users.
     */
    public function getPresence(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        $userIds = $request->input('user_ids');

        $presences = UserPresence::whereIn('user_id', $userIds)
            ->with('user:id,name,foto_perfil')
            ->get()
            ->map(function ($presence) {
                return [
                    'user_id' => $presence->user_id,
                    'name' => $presence->user->name,
                    'foto_perfil' => $presence->user->foto_perfil,
                    'status' => $presence->status,
                    'is_online' => $presence->isOnline(),
                    'last_seen' => $presence->getLastSeenFormatted(),
                    'last_seen_at' => $presence->last_seen_at?->toISOString(),
                ];
            });

        return response()->json([
            'presences' => $presences,
        ]);
    }

    /**
     * Send typing indicator.
     */
    public function typing(Request $request)
    {
        $request->validate([
            'conversacion_id' => 'required|integer|exists:conversaciones,id',
            'is_typing' => 'required|boolean',
        ]);

        $user = $request->user();
        $conversacionId = $request->input('conversacion_id');
        $isTyping = $request->input('is_typing');

        // Verify user has access to this conversation
        $hasAccess = \App\Models\Conversacion::where('id', $conversacionId)
            ->where(function ($query) use ($user) {
                $query->where('usuario1_id', $user->id)
                    ->orWhere('usuario2_id', $user->id);
            })
            ->exists();

        if (!$hasAccess) {
            return response()->json([
                'error' => 'No tienes acceso a esta conversación',
            ], 403);
        }

        // Broadcast typing event
        broadcast(new UserTyping($user, $conversacionId, $isTyping))->toOthers();

        return response()->json([
            'message' => 'Indicador de escritura enviado',
        ]);
    }

    /**
     * Get online users count.
     */
    public function onlineCount()
    {
        $count = UserPresence::where('status', 'online')->count();

        return response()->json([
            'online_count' => $count,
        ]);
    }

    /**
     * Mark user as away after inactivity.
     */
    public function markAway(Request $request)
    {
        $user = $request->user();

        $presence = UserPresence::where('user_id', $user->id)->first();

        if ($presence && $presence->status === 'online') {
            $presence->update(['status' => 'away']);

            return response()->json([
                'message' => 'Estado actualizado a ausente',
                'presence' => $presence,
            ]);
        }

        return response()->json([
            'message' => 'No hay cambios',
        ]);
    }
}
