<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'email', 'telefono', 'fecha_nacimiento']));

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user
        ]);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Delete old photo if exists
        if ($user->foto_perfil && Storage::disk('public')->exists($user->foto_perfil)) {
            Storage::disk('public')->delete($user->foto_perfil);
        }

        // Store new photo
        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->update([
            'foto_perfil' => $path
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto de perfil actualizada exitosamente',
            'photo_url' => Storage::url($path),
            'user' => $user
        ]);
    }

    /**
     * Delete profile photo.
     */
    public function deletePhoto(Request $request)
    {
        $user = $request->user();

        if ($user->foto_perfil && Storage::disk('public')->exists($user->foto_perfil)) {
            Storage::disk('public')->delete($user->foto_perfil);
        }

        $user->update([
            'foto_perfil' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto de perfil eliminada exitosamente',
            'user' => $user
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed|different:current_password'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ]);
    }

    /**
     * Update user preferences.
     */
    public function updatePreferences(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'dark_mode' => 'nullable|boolean',
            'animations' => 'nullable|boolean',
            'language' => 'nullable|string|in:es,en'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $preferences = $user->preferences ?? [];
        
        if ($request->has('dark_mode')) {
            $preferences['dark_mode'] = $request->dark_mode;
        }
        
        if ($request->has('animations')) {
            $preferences['animations'] = $request->animations;
        }
        
        if ($request->has('language')) {
            $preferences['language'] = $request->language;
        }

        $user->update([
            'preferences' => $preferences
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Preferencias actualizadas exitosamente',
            'preferences' => $preferences
        ]);
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'email_messages' => 'nullable|boolean',
            'email_reminders' => 'nullable|boolean',
            'email_updates' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $notifications = $user->notification_settings ?? [];
        
        if ($request->has('email_messages')) {
            $notifications['email_messages'] = $request->email_messages;
        }
        
        if ($request->has('email_reminders')) {
            $notifications['email_reminders'] = $request->email_reminders;
        }
        
        if ($request->has('email_updates')) {
            $notifications['email_updates'] = $request->email_updates;
        }

        $user->update([
            'notification_settings' => $notifications
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Configuración de notificaciones actualizada',
            'notifications' => $notifications
        ]);
    }
}
