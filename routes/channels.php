<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Canal privado del usuario - Solo el usuario puede escuchar su propio canal
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal de chat - Solo usuarios que participan en la conversación
Broadcast::channel('chat.{conversacionId}', function ($user, $conversacionId) {
    // TODO: Implementar verificación cuando el modelo Conversacion esté disponible
    // Por ahora, permitir acceso a usuarios autenticados
    // En producción, verificar que el usuario pertenece a la conversación
    
    return $user !== null;
});

// Canal de sesión - Solo paciente y profesional de la sesión
Broadcast::channel('session.{sesionId}', function ($user, $sesionId) {
    $sesion = \App\Models\Sesion::find($sesionId);
    
    if (!$sesion) {
        return false;
    }
    
    // Verificar si el usuario es el paciente o el profesional de la sesión
    return $sesion->id_paciente === $user->id || 
           $sesion->profesional_id === $user->id;
});

// Canal de plan - Solo paciente y su nutricionista
Broadcast::channel('plan.{planId}', function ($user, $planId) {
    $plan = \App\Models\PlanAlimentacion::find($planId);
    
    if (!$plan) {
        return false;
    }
    
    // Verificar si el usuario es el paciente del plan o su nutricionista
    return $plan->id_paciente === $user->id || 
           $plan->id_nutricionista === $user->id;
});
