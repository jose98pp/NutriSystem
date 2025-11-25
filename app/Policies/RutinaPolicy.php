<?php

namespace App\Policies;

use App\Models\Rutina;
use App\Models\User;

class RutinaPolicy
{
    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Rutina $rutina)
    {
        return true;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin', 'nutricionista']);
    }

    public function update(User $user, Rutina $rutina)
    {
        return $user->role === 'admin' || 
               ($user->role === 'nutricionista' && $rutina->created_by === $user->id);
    }

    public function delete(User $user, Rutina $rutina)
    {
        return $user->role === 'admin' || 
               ($user->role === 'nutricionista' && $rutina->created_by === $user->id);
    }

    public function asignar(User $user)
    {
        return in_array($user->role, ['admin', 'nutricionista']);
    }
}
