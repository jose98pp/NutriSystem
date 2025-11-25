<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Illuminate\Http\Request;

class PacienteController extends Controller
{
    /**
     * Listar pacientes
     */

    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Paciente::with('nutricionista');
        
        // Filtro por nutricionista específico (para la vista de pacientes por nutricionista)
        if ($request->has('nutricionista_id')) {
            $query->where('id_nutricionista', $request->nutricionista_id);
        }
        // Si es nutricionista, solo ver sus pacientes
        elseif ($user && $user->isNutricionista()) {
            $nutricionista = $user->nutricionista;
            if ($nutricionista) {
                $query->where('id_nutricionista', $nutricionista->id_nutricionista);
            } else {
                $query->where('id_nutricionista', null);
            }
        }
        
        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $pacientes = $query->paginate(15);
        
        return response()->json($pacientes);
    }

    /**
     * Registrar nuevo paciente
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'fecha_nacimiento' => 'required|date|before:today',
            'genero' => 'required|in:M,F,Otro',
            'email' => 'required|email|unique:pacientes,email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'peso_inicial' => 'nullable|numeric|min:10|max:500', // Rango más amplio
            'estatura' => 'nullable|numeric|min:0.3|max:3.0',   // Rango más amplio
            'peso_objetivo_kg' => 'nullable|numeric|min:10|max:500',
            'alergias' => 'nullable|string|max:1000',
            'restricciones_alimentarias' => 'nullable|string|max:1000',
            'password' => 'nullable|string|min:8',
        ]);

        $currentUser = $request->user();
        $nutricionistaId = null;

        if ($currentUser->isNutricionista()) {
            $nutricionistaId = $currentUser->nutricionista->id_nutricionista;
        }

        // Crear usuario para el paciente
        $userPaciente = \App\Models\User::create([
            'name' => $request->nombre . ' ' . $request->apellido,
            'email' => $request->email,
            'password' => bcrypt($request->password ?? 'password123'), // Password por defecto si no se proporciona
            'role' => 'paciente',
        ]);

        // Crear paciente vinculado al usuario
        $paciente = Paciente::create([
            'user_id' => $userPaciente->id,
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'genero' => $request->genero,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'peso_inicial' => $request->peso_inicial,
            'estatura' => $request->estatura,
            'alergias' => $request->alergias,
            'id_nutricionista' => $nutricionistaId,
        ]);

        return response()->json([
            'message' => 'Paciente registrado exitosamente',
            'paciente' => $paciente->load('nutricionista')
        ], 201);
    }

    /**
     * Mostrar paciente específico
     */
    public function show($id)
    {
        $paciente = Paciente::with(['nutricionista', 'planesAlimentacion', 'evaluaciones.medicion'])
                            ->findOrFail($id);
        
        return response()->json($paciente);
    }

    /**
     * Actualizar paciente
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'apellido' => 'sometimes|string|max:100',
            'fecha_nacimiento' => 'sometimes|date|before:today',
            'genero' => 'sometimes|in:M,F,Otro',
            'email' => 'sometimes|email|unique:pacientes,email,' . $id . ',id_paciente',
            'telefono' => 'nullable|string|max:20',
            'peso_inicial' => 'nullable|numeric|min:10|max:500', // Rango más amplio
            'estatura' => 'nullable|numeric|min:0.3|max:3.0',   // Rango más amplio
            'peso_objetivo_kg' => 'nullable|numeric|min:10|max:500',
            'alergias' => 'nullable|string|max:1000',
            'restricciones_alimentarias' => 'nullable|string|max:1000',
        ]);

        $paciente = Paciente::findOrFail($id);
        $paciente->update($request->all());

        return response()->json([
            'message' => 'Paciente actualizado exitosamente',
            'paciente' => $paciente
        ]);
    }

    /**
     * Eliminar paciente
     */
    public function destroy($id)
    {
        $paciente = Paciente::findOrFail($id);
        
        // Guardar el user_id antes de eliminar el paciente
        $userId = $paciente->user_id;
        
        // Eliminar el paciente
        $paciente->delete();
        
        // Eliminar el usuario asociado si existe
        if ($userId) {
            \App\Models\User::where('id', $userId)->delete();
        }

        return response()->json([
            'message' => 'Paciente eliminado exitosamente'
        ]);
    }

    /**
     * Asignar nutricionista por el propio paciente (onboarding)
     */
    public function asignarNutricionista(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente ?? null;
        if (!$paciente) {
            return response()->json([
                'message' => 'No eres un paciente registrado'
            ], 403);
        }

        $request->validate([
            'id_nutricionista' => 'required|exists:nutricionistas,id_nutricionista'
        ]);

        $paciente->id_nutricionista = $request->id_nutricionista;
        $paciente->save();

        return response()->json([
            'message' => 'Nutricionista asignado correctamente',
            'paciente' => $paciente->load('nutricionista')
        ]);
    }
}
