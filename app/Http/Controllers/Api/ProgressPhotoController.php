<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgressPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProgressPhotoController extends Controller
{
    /**
     * Listar fotos de progreso
     */
    public function index(Request $request)
    {
        $query = ProgressPhoto::with('paciente');
        $user = $request->user();

        // Si es paciente, solo sus fotos (buscar su registro en la tabla pacientes)
        if ($user && $user->role === 'paciente') {
            $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            if ($paciente) {
                $query->where('id_paciente', $paciente->id_paciente);
            }
        }

        // Filtrar por paciente si se proporciona
        if ($request->has('id_paciente')) {
            $query->where('id_paciente', $request->id_paciente);
        }

        // Filtrar por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        $fotos = $query->orderBy('fecha', 'desc')->paginate(12);

        return response()->json($fotos);
    }

    /**
     * Obtener fotos de un paciente específico
     */
    public function getFotosPaciente($pacienteId)
    {
        $fotos = ProgressPhoto::where('id_paciente', $pacienteId)
            ->with('paciente')
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json($fotos);
    }

    /**
     * Mostrar una foto específica
     */
    public function show($id)
    {
        $foto = ProgressPhoto::with('paciente')->findOrFail($id);

        return response()->json($foto);
    }

    /**
     * Subir nueva foto de progreso
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'titulo' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
            'tipo' => 'required|in:antes,durante,despues',
            'peso_kg' => 'nullable|numeric|min:20|max:300',
            'fecha' => 'required|date'
        ]);

        // Validar que pacientes solo puedan subir sus propias fotos
        $user = $request->user();
        if ($user->role === 'paciente') {
            $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            if (!$paciente || $paciente->id_paciente != $request->id_paciente) {
                return response()->json([
                    'message' => 'No tienes permiso para subir fotos de otro paciente'
                ], 403);
            }
        }

        // Subir imagen
        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = 'progress_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('progress_photos', $filename, 'public');

            $foto = ProgressPhoto::create([
                'id_paciente' => $request->id_paciente,
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'foto_url' => $path,
                'tipo' => $request->tipo,
                'peso_kg' => $request->peso_kg,
                'fecha' => $request->fecha
            ]);

            return response()->json([
                'message' => 'Foto subida exitosamente',
                'foto' => $foto->load('paciente')
            ], 201);
        }

        return response()->json([
            'message' => 'No se recibió ninguna imagen'
        ], 400);
    }

    /**
     * Actualizar foto de progreso
     */
    public function update(Request $request, $id)
    {
        $foto = ProgressPhoto::findOrFail($id);

        $request->validate([
            'titulo' => 'sometimes|required|string|max:150',
            'descripcion' => 'nullable|string',
            'foto' => 'sometimes|image|mimes:jpeg,png,jpg|max:5120',
            'tipo' => 'sometimes|required|in:antes,durante,despues',
            'peso_kg' => 'nullable|numeric|min:20|max:300',
            'fecha' => 'sometimes|required|date'
        ]);

        // Si hay nueva imagen, eliminar la anterior y subir nueva
        if ($request->hasFile('foto')) {
            // Eliminar imagen anterior
            if (Storage::disk('public')->exists($foto->foto_url)) {
                Storage::disk('public')->delete($foto->foto_url);
            }

            $file = $request->file('foto');
            $filename = 'progress_' . time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('progress_photos', $filename, 'public');
            $foto->foto_url = $path;
        }

        $foto->update($request->except('foto'));

        return response()->json([
            'message' => 'Foto actualizada exitosamente',
            'foto' => $foto->load('paciente')
        ]);
    }

    /**
     * Eliminar foto de progreso
     */
    public function destroy($id)
    {
        $foto = ProgressPhoto::findOrFail($id);

        // Eliminar archivo de almacenamiento
        if (Storage::disk('public')->exists($foto->foto_url)) {
            Storage::disk('public')->delete($foto->foto_url);
        }

        $foto->delete();

        return response()->json([
            'message' => 'Foto eliminada exitosamente'
        ]);
    }

    /**
     * Comparación antes/después
     */
    public function comparacion($pacienteId)
    {
        $fotoAntes = ProgressPhoto::where('id_paciente', $pacienteId)
            ->where('tipo', 'antes')
            ->orderBy('fecha', 'asc')
            ->first();

        $fotoDespues = ProgressPhoto::where('id_paciente', $pacienteId)
            ->where('tipo', 'despues')
            ->orderBy('fecha', 'desc')
            ->first();

        return response()->json([
            'antes' => $fotoAntes,
            'despues' => $fotoDespues,
            'diferencia_peso' => $fotoAntes && $fotoDespues 
                ? round($fotoAntes->peso_kg - $fotoDespues->peso_kg, 2)
                : null
        ]);
    }

    /**
     * Timeline de progreso
     */
    public function timeline($pacienteId)
    {
        $fotos = ProgressPhoto::where('id_paciente', $pacienteId)
            ->orderBy('fecha', 'asc')
            ->get()
            ->groupBy(function($foto) {
                return $foto->fecha->format('Y-m');
            });

        return response()->json($fotos);
    }
}
