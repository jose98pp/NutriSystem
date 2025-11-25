<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sesion;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SesionController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Listar sesiones
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Sesion::with(['paciente.user', 'notas']);

        // Filtrar según rol
        if ($user->role === 'psicologo') {
            $psicologo = $user->psicologo;
            $query->where('profesional_id', $psicologo->id_psicologo)
                  ->where('tipo_profesional', 'PSICOLOGO');
        } elseif ($user->role === 'nutricionista') {
            $nutricionista = $user->nutricionista;
            $query->where('profesional_id', $nutricionista->id_nutricionista)
                  ->where('tipo_profesional', 'NUTRICIONISTA');
        }

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo_sesion')) {
            $query->where('tipo_sesion', $request->tipo_sesion);
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha_hora', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha_hora', '<=', $request->fecha_hasta);
        }

        $sesiones = $query->orderBy('fecha_hora', 'desc')->paginate(15);

        return response()->json($sesiones);
    }

    /**
     * Crear nueva sesión
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            // Log para debugging
            \Log::info('Creando sesión', [
                'user_id' => $user->id,
                'role' => $user->role,
                'data' => $request->all()
            ]);

            // Validación base
            $rules = [
                'id_paciente' => 'required|exists:pacientes,id_paciente',
                'tipo_profesional' => 'required|in:NUTRICIONISTA,PSICOLOGO',
                'tipo_sesion' => 'required|in:PRESENCIAL,VIDEOLLAMADA',
                'fecha_hora' => 'required|date|after:now',
                'duracion_minutos' => 'nullable|integer|min:15|max:180',
                'motivo' => 'nullable|string',
                'notas' => 'nullable|string'
            ];

            // Si es admin, requiere profesional_id
            if ($user->role === 'admin') {
                $rules['profesional_id'] = 'required|integer';
            }

            $validated = $request->validate($rules);

        // Determinar profesional_id según el tipo y rol
        if ($request->tipo_profesional === 'PSICOLOGO') {
            if ($user->role === 'psicologo') {
                // Psicólogo crea su propia sesión
                if (!$user->psicologo) {
                    return response()->json([
                        'message' => 'Tu usuario no tiene un perfil de psicólogo asociado. Contacta al administrador.'
                    ], 400);
                }
                $profesionalId = $user->psicologo->id_psicologo;
            } elseif ($user->role === 'admin' || $user->role === 'nutricionista') {
                // Admin o Nutricionista puede asignar cualquier psicólogo
                if (!$request->profesional_id) {
                    return response()->json([
                        'message' => 'Debes seleccionar un psicólogo'
                    ], 400);
                }
                $profesionalId = $request->profesional_id;
            } else {
                return response()->json(['message' => 'No autorizado para crear sesiones de psicólogo'], 403);
            }
        } else {
            if ($user->role === 'nutricionista') {
                // Nutricionista crea su propia sesión
                if (!$user->nutricionista) {
                    return response()->json([
                        'message' => 'Tu usuario no tiene un perfil de nutricionista asociado. Contacta al administrador.'
                    ], 400);
                }
                $profesionalId = $user->nutricionista->id_nutricionista;
            } elseif ($user->role === 'admin' || $user->role === 'psicologo') {
                // Admin o Psicólogo puede asignar cualquier nutricionista
                if (!$request->profesional_id) {
                    return response()->json([
                        'message' => 'Debes seleccionar un nutricionista'
                    ], 400);
                }
                $profesionalId = $request->profesional_id;
            } else {
                return response()->json(['message' => 'No autorizado para crear sesiones de nutricionista'], 403);
            }
        }

        DB::beginTransaction();
        try {
            $sesion = Sesion::create([
                'id_paciente' => $request->id_paciente,
                'profesional_id' => $profesionalId,
                'tipo_profesional' => $request->tipo_profesional,
                'tipo_sesion' => $request->tipo_sesion,
                'fecha_hora' => $request->fecha_hora,
                'duracion_minutos' => $request->duracion_minutos ?? 60,
                'estado' => 'PROGRAMADA',
                'motivo' => $request->motivo,
                'notas' => $request->notas
            ]);

            // Generar link de videollamada si es necesario
            if ($request->tipo_sesion === 'VIDEOLLAMADA') {
                $sesion->generarLinkVideollamada();
            }

            // Enviar notificación de sesión creada
            try {
                $this->notificationService->notificarSesionCreada($sesion);
            } catch (\Exception $e) {
                \Log::error('Error al enviar notificación de sesión creada', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Sesión creada exitosamente',
                'data' => $sesion->load('paciente')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear sesión en DB', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al crear sesión',
                'error' => $e->getMessage()
            ], 500);
        }
        
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Error de validación al crear sesión', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error general al crear sesión', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error inesperado al crear sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar sesión específica
     */
    public function show($id)
    {
        $sesion = Sesion::with(['paciente.user', 'notas'])->findOrFail($id);

        return response()->json([
            'data' => $sesion
        ]);
    }

    /**
     * Actualizar sesión
     */
    public function update(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);

        $request->validate([
            'fecha_hora' => 'sometimes|date',
            'duracion_minutos' => 'sometimes|integer|min:15|max:180',
            'estado' => 'sometimes|in:PROGRAMADA,EN_CURSO,COMPLETADA,CANCELADA',
            'motivo' => 'nullable|string',
            'notas' => 'nullable|string'
        ]);

        try {
            // Guardar valores anteriores para detectar cambios
            $estadoAnterior = $sesion->estado;
            $fechaAnterior = $sesion->fecha_hora;

            $sesion->update($request->only([
                'fecha_hora',
                'duracion_minutos',
                'estado',
                'motivo',
                'notas'
            ]));

            // Detectar si fue cancelada
            if ($request->has('estado') && $request->estado === 'CANCELADA' && $estadoAnterior !== 'CANCELADA') {
                try {
                    $this->notificationService->notificarSesionCancelada($sesion);
                } catch (\Exception $e) {
                    \Log::error('Error al enviar notificación de sesión cancelada', [
                        'sesion_id' => $sesion->id_sesion,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Detectar si fue reprogramada (cambió la fecha)
            if ($request->has('fecha_hora') && $fechaAnterior != $request->fecha_hora) {
                try {
                    $this->notificationService->notificarSesionReprogramada($sesion, $fechaAnterior);
                } catch (\Exception $e) {
                    \Log::error('Error al enviar notificación de sesión reprogramada', [
                        'sesion_id' => $sesion->id_sesion,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json([
                'message' => 'Sesión actualizada exitosamente',
                'data' => $sesion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar sesión
     */
    public function destroy($id)
    {
        $sesion = Sesion::findOrFail($id);

        try {
            $sesion->delete();

            return response()->json([
                'message' => 'Sesión eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Iniciar sesión
     */
    public function iniciar($id)
    {
        $sesion = Sesion::findOrFail($id);

        if ($sesion->estado !== 'PROGRAMADA') {
            return response()->json([
                'message' => 'La sesión no está en estado PROGRAMADA'
            ], 400);
        }

        try {
            $sesion->update(['estado' => 'EN_CURSO']);

            // Si es videollamada, enviar notificación de videollamada iniciada
            if ($sesion->tipo_sesion === 'VIDEOLLAMADA') {
                try {
                    $this->notificationService->notificarVideollamadaIniciada($sesion);
                } catch (\Exception $e) {
                    \Log::error('Error al enviar notificación de videollamada iniciada', [
                        'sesion_id' => $sesion->id_sesion,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json([
                'message' => 'Sesión iniciada',
                'data' => $sesion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Completar sesión
     */
    public function completar(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);

        $request->validate([
            'notas' => 'nullable|string'
        ]);

        try {
            $sesion->update([
                'estado' => 'COMPLETADA',
                'notas' => $request->notas ?? $sesion->notas
            ]);

            return response()->json([
                'message' => 'Sesión completada',
                'data' => $sesion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al completar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar sesión
     */
    public function cancelar(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);

        $request->validate([
            'motivo_cancelacion' => 'required|string'
        ]);

        try {
            $sesion->update([
                'estado' => 'CANCELADA',
                'notas' => ($sesion->notas ?? '') . "\n\nMotivo de cancelación: " . $request->motivo_cancelacion
            ]);

            // Enviar notificación de sesión cancelada
            try {
                $this->notificationService->notificarSesionCancelada($sesion);
            } catch (\Exception $e) {
                \Log::error('Error al enviar notificación de sesión cancelada', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'message' => 'Sesión cancelada',
                'data' => $sesion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cancelar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mis sesiones (para pacientes)
     */
    public function misSesiones(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'No eres un paciente'], 403);
        }

        $query = Sesion::where('id_paciente', $paciente->id_paciente)
                       ->with('notas');

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $sesiones = $query->orderBy('fecha_hora', 'desc')->paginate(15);

        return response()->json($sesiones);
    }

    /**
     * Próximas sesiones (para pacientes)
     */
    public function proximasSesiones(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json(['message' => 'No eres un paciente'], 403);
        }

        $sesiones = Sesion::where('id_paciente', $paciente->id_paciente)
                          ->where('estado', 'PROGRAMADA')
                          ->where('fecha_hora', '>=', now())
                          ->orderBy('fecha_hora', 'asc')
                          ->limit(5)
                          ->get();

        return response()->json([
            'data' => $sesiones
        ]);
    }
}
