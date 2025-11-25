<?php

namespace App\Policies;

use App\Models\Ejercicio;
use App\Models\User;

class EjercicioPolicy
{
    public function viewAny(User $user)
    {
        return true; // Todos los autenticados pueden ver ejercicios
    }

    public function view(User $user, Ejercicio $ejercicio)
    {
        return true;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin', 'nutricionista']);
    }

    public function update(User $user, Ejercicio $ejercicio)
    {
        return $user->role === 'admin' || 
               ($user->role === 'nutricionista' && $ejercicio->created_by === $user->id);
    }

    public function delete(User $user, Ejercicio $ejercicio)
    {
        return $user->role === 'admin';
    }
}
