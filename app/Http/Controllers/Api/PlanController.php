<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Obtener todos los planes disponibles
     */
    public function disponibles()
    {
        $planes = Plan::where('activo', true)
            ->orderBy('precio', 'asc')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'nombre' => $plan->nombre,
                    'precio' => (float) $plan->precio,
                    'descripcion' => $plan->descripcion,
                    'caracteristicas' => json_decode($plan->caracteristicas, true) ?? [],
                    'popular' => $plan->popular ?? false,
                ];
            });

        return response()->json([
            'planes' => $planes,
        ]);
    }

    /**
     * Obtener un plan específico
     */
    public function show($id)
    {
        $plan = Plan::findOrFail($id);

        return response()->json([
            'plan' => [
                'id' => $plan->id,
                'nombre' => $plan->nombre,
                'precio' => (float) $plan->precio,
                'descripcion' => $plan->descripcion,
                'caracteristicas' => json_decode($plan->caracteristicas, true) ?? [],
                'popular' => $plan->popular ?? false,
            ],
        ]);
    }
}
