<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Psicologo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PsicologoController extends Controller
{
    /**
     * Listar psicólogos
     */
    public function index(Request $request)
    {
        $query = Psicologo::with('user');

        // Filtrar por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('cedula_profesional', 'like', "%{$search}%");
            });
        }

        $psicologos = $query->orderBy('nombre')->paginate(15);

        return response()->json($psicologos);
    }

    /**
     * Crear nuevo psicólogo
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'cedula_profesional' => 'nullable|string|max:50|unique:psicologos,cedula_profesional',
            'especialidad' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'foto_perfil' => 'nullable|image|max:2048'
        ]);

        DB::beginTransaction();
        try {
            // Crear usuario
            $user = User::create([
                'name' => $request->nombre . ' ' . $request->apellido,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'psicologo'
            ]);

            // Manejar foto de perfil
            $fotoPath = null;
            if ($request->hasFile('foto_perfil')) {
                $fotoPath = $request->file('foto_perfil')->store('psicologos', 'public');
            }

            // Crear psicólogo
            $psicologo = Psicologo::create([
                'user_id' => $user->id,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'cedula_profesional' => $request->cedula_profesional,
                'especialidad' => $request->especialidad,
                'telefono' => $request->telefono,
                'foto_perfil' => $fotoPath,
                'estado' => 'ACTIVO'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Psicólogo creado exitosamente',
                'data' => $psicologo->load('user')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear psicólogo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar psicólogo específico
     */
    public function show($id)
    {
        $psicologo = Psicologo::with(['user', 'pacientes', 'sesiones'])
                              ->findOrFail($id);

        return response()->json([
            'data' => $psicologo
        ]);
    }

    /**
     * Actualizar psicólogo
     */
    public function update(Request $request, $id)
    {
        $psicologo = Psicologo::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $psicologo->user_id,
            'cedula_profesional' => 'nullable|string|max:50|unique:psicologos,cedula_profesional,' . $id . ',id_psicologo',
            'especialidad' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'sometimes|in:ACTIVO,INACTIVO',
            'foto_perfil' => 'nullable|image|max:2048'
        ]);

        DB::beginTransaction();
        try {
            // Actualizar usuario si se proporciona email
            if ($request->has('email')) {
                $psicologo->user->update([
                    'email' => $request->email
                ]);
            }

            if ($request->has('nombre') || $request->has('apellido')) {
                $nombre = $request->nombre ?? $psicologo->nombre;
                $apellido = $request->apellido ?? $psicologo->apellido;
                $psicologo->user->update([
                    'name' => $nombre . ' ' . $apellido
                ]);
            }

            // Manejar foto de perfil
            if ($request->hasFile('foto_perfil')) {
                // Eliminar foto anterior si existe
                if ($psicologo->foto_perfil) {
                    \Storage::disk('public')->delete($psicologo->foto_perfil);
                }
                $fotoPath = $request->file('foto_perfil')->store('psicologos', 'public');
                $request->merge(['foto_perfil' => $fotoPath]);
            }

            // Actualizar psicólogo
            $psicologo->update($request->only([
                'nombre',
                'apellido',
                'cedula_profesional',
                'especialidad',
                'telefono',
                'foto_perfil',
                'estado'
            ]));

            DB::commit();

            return response()->json([
                'message' => 'Psicólogo actualizado exitosamente',
                'data' => $psicologo->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar psicólogo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar psicólogo
     */
    public function destroy($id)
    {
        $psicologo = Psicologo::findOrFail($id);

        DB::beginTransaction();
        try {
            // Eliminar foto si existe
            if ($psicologo->foto_perfil) {
                \Storage::disk('public')->delete($psicologo->foto_perfil);
            }

            // Eliminar usuario (esto eliminará el psicólogo por cascade)
            $psicologo->user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Psicólogo eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar psicólogo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Asignar psicólogo a paciente
     */
    public function asignarPaciente(Request $request, $id)
    {
        $request->validate([
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'notas' => 'nullable|string'
        ]);

        $psicologo = Psicologo::findOrFail($id);

        try {
            $psicologo->pacientes()->attach($request->id_paciente, [
                'fecha_asignacion' => now(),
                'estado' => 'ACTIVO',
                'notas' => $request->notas
            ]);

            return response()->json([
                'message' => 'Paciente asignado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al asignar paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desasignar psicólogo de paciente
     */
    public function desasignarPaciente($id, $idPaciente)
    {
        $psicologo = Psicologo::findOrFail($id);

        try {
            $psicologo->pacientes()->detach($idPaciente);

            return response()->json([
                'message' => 'Paciente desasignado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al desasignar paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener pacientes del psicólogo
     */
    public function pacientes($id)
    {
        $psicologo = Psicologo::findOrFail($id);
        $pacientes = $psicologo->pacientes()
                               ->wherePivot('estado', 'ACTIVO')
                               ->with('user')
                               ->get();

        return response()->json([
            'data' => $pacientes
        ]);
    }
}
