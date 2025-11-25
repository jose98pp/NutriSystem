<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nutricionista;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class NutricionistaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $nutricionistas = Nutricionista::withCount('pacientes')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $nutricionistas
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email|unique:nutricionistas,email',
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create user
            $user = User::create([
                'name' => $request->nombre . ' ' . $request->apellido,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'nutricionista'
            ]);

            // Create nutricionista
            $nutricionista = Nutricionista::create([
                'user_id' => $user->id,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'telefono' => $request->telefono,
                'especialidad' => $request->especialidad
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nutricionista creado exitosamente',
                'data' => $nutricionista
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear nutricionista: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $nutricionista = Nutricionista::withCount('pacientes')->find($id);

        if (!$nutricionista) {
            return response()->json([
                'success' => false,
                'message' => 'Nutricionista no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $nutricionista
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $nutricionista = Nutricionista::find($id);

        if (!$nutricionista) {
            return response()->json([
                'success' => false,
                'message' => 'Nutricionista no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:nutricionistas,email,' . $id . ',id_nutricionista|unique:users,email,' . $nutricionista->user_id,
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update nutricionista
            $nutricionista->update($request->only(['nombre', 'apellido', 'email', 'telefono', 'especialidad']));

            // Update user if exists
            if ($nutricionista->user_id) {
                $userData = [
                    'name' => ($request->nombre ?? $nutricionista->nombre) . ' ' . ($request->apellido ?? $nutricionista->apellido),
                    'email' => $request->email ?? $nutricionista->email
                ];

                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }

                User::where('id', $nutricionista->user_id)->update($userData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nutricionista actualizado exitosamente',
                'data' => $nutricionista
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar nutricionista: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $nutricionista = Nutricionista::find($id);

        if (!$nutricionista) {
            return response()->json([
                'success' => false,
                'message' => 'Nutricionista no encontrado'
            ], 404);
        }

        // Check if nutricionista has pacientes
        if ($nutricionista->pacientes()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el nutricionista porque tiene pacientes asignados'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $userId = $nutricionista->user_id;
            $nutricionista->delete();
            
            // Delete associated user
            if ($userId) {
                User::where('id', $userId)->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nutricionista eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar nutricionista: ' . $e->getMessage()
            ], 500);
        }
    }
}
