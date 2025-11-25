<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\PreferencesUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserPreferencesController extends Controller
{
    /**
     * Get user preferences
     */
    public function index()
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'preferences' => $user->preferences ?? [],
        ]);
    }

    /**
     * Update user preferences
     * Task 18: Implementar sincronización de tema
     * Requirements: 6, 7
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme' => 'nullable|in:light,dark,system',
            'notifications_enabled' => 'nullable|boolean',
            'language' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $currentPreferences = $user->preferences ?? [];
        
        // Merge new preferences with existing ones
        $newPreferences = array_merge($currentPreferences, $request->only([
            'theme',
            'notifications_enabled',
            'language',
        ]));

        // Remove null values
        $newPreferences = array_filter($newPreferences, function($value) {
            return $value !== null;
        });

        $user->preferences = $newPreferences;
        $user->save();

        // Broadcast preference update to all user's devices
        broadcast(new PreferencesUpdated($user->id, $newPreferences))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Preferencias actualizadas correctamente',
            'preferences' => $newPreferences,
        ]);
    }

    /**
     * Update theme preference
     */
    public function updateTheme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme' => 'required|in:light,dark,system',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        $preferences['theme'] = $request->theme;
        
        $user->preferences = $preferences;
        $user->save();

        // Broadcast theme update to all user's devices
        broadcast(new PreferencesUpdated($user->id, $preferences))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Tema actualizado correctamente',
            'theme' => $request->theme,
        ]);
    }
}
