<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GrupoMuscular;
use Illuminate\Http\Request;

class GrupoMuscularController extends Controller
{
    public function index()
    {
        $grupos = GrupoMuscular::ordenados()->get();
        return response()->json($grupos);
    }

    public function show($id)
    {
        $grupo = GrupoMuscular::with('ejercicios')->findOrFail($id);
        return response()->json($grupo);
    }

    public function modeloAnatomico()
    {
        $grupos = GrupoMuscular::ordenados()
            ->select('id', 'nombre', 'zona_corporal', 'svg_path', 'color_hex', 'orden')
            ->get();

        return response()->json([
            'grupos' => $grupos,
            'zonas' => [
                'superior' => $grupos->where('zona_corporal', 'superior')->values(),
                'core' => $grupos->where('zona_corporal', 'core')->values(),
                'inferior' => $grupos->where('zona_corporal', 'inferior')->values(),
            ]
        ]);
    }
}
