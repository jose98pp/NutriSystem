<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suscripcion;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SuscripcionController extends Controller
{
    /**
     * Crear una nueva suscripción
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'servicio_id' => 'required|exists:servicios,id_servicio',
            'metodo_pago' => 'required|array',
            'metodo_pago.tipo' => 'required|string',
            'metodo_pago.numero' => 'required|string',
            'metodo_pago.nombre' => 'required|string',
            'metodo_pago.expiracion' => 'required|string',
            'metodo_pago.cvv' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de pago inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $servicio = Servicio::where('id_servicio', $request->servicio_id)->firstOrFail();

        // Verificar si ya tiene una suscripción activa
        $suscripcionActiva = Suscripcion::where('user_id', $user->id)
            ->where('estado', 'activa')
            ->first();

        if ($suscripcionActiva) {
            return response()->json([
                'message' => 'Ya tienes una suscripción activa',
            ], 400);
        }

        // Simular procesamiento de pago (en producción, integrar con Stripe, PayPal, etc.)
        $metodoPago = $request->metodo_pago;
        
        // Validar tarjeta de prueba
        $numeroTarjeta = str_replace(' ', '', $metodoPago['numero']);
        if ($numeroTarjeta !== '4242424242424242') {
            return response()->json([
                'message' => 'Tarjeta rechazada. Usa 4242 4242 4242 4242 para pruebas.',
            ], 400);
        }

        // Crear suscripción
        $suscripcion = Suscripcion::create([
            'user_id' => $user->id,
            'servicio_id' => $servicio->id_servicio,
            'estado' => 'activa',
            'fecha_inicio' => Carbon::now(),
            'fecha_fin' => Carbon::now()->addDays($servicio->duracion_dias),
            'proximo_cobro' => Carbon::now()->addDays($servicio->duracion_dias),
            'metodo_pago' => json_encode([
                'tipo' => $metodoPago['tipo'],
                'ultimos_digitos' => substr($numeroTarjeta, -4),
                'nombre' => $metodoPago['nombre'],
            ]),
        ]);

        return response()->json([
            'message' => 'Suscripción creada exitosamente',
            'suscripcion' => [
                'id' => $suscripcion->id,
                'servicio' => [
                    'id' => $servicio->id_servicio,
                    'nombre' => $servicio->nombre,
                    'precio' => (float) $servicio->costo,
                ],
                'estado' => $suscripcion->estado,
                'fecha_inicio' => $suscripcion->fecha_inicio->format('Y-m-d'),
                'proximo_cobro' => $suscripcion->proximo_cobro->format('Y-m-d'),
            ],
        ], 201);
    }

    /**
     * Obtener la suscripción activa del usuario
     */
    public function activa(Request $request)
    {
        $user = $request->user();

        $suscripcion = Suscripcion::with('servicio')
            ->where('user_id', $user->id)
            ->where('estado', 'activa')
            ->first();

        if (!$suscripcion) {
            return response()->json([
                'message' => 'No tienes una suscripción activa',
                'suscripcion' => null,
            ]);
        }

        return response()->json([
            'suscripcion' => [
                'id' => $suscripcion->id,
                'servicio' => [
                    'id' => $suscripcion->servicio->id_servicio,
                    'nombre' => $suscripcion->servicio->nombre,
                    'precio' => (float) $suscripcion->servicio->costo,
                    'descripcion' => $suscripcion->servicio->descripcion,
                    'tipo' => $suscripcion->servicio->tipo_servicio,
                    'duracion_dias' => $suscripcion->servicio->duracion_dias,
                ],
                'estado' => $suscripcion->estado,
                'fecha_inicio' => $suscripcion->fecha_inicio->format('Y-m-d'),
                'proximo_cobro' => $suscripcion->proximo_cobro->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Cancelar suscripción
     */
    public function cancelar(Request $request, $id)
    {
        $user = $request->user();

        $suscripcion = Suscripcion::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($suscripcion->estado !== 'activa') {
            return response()->json([
                'message' => 'Esta suscripción no está activa',
            ], 400);
        }

        $suscripcion->update([
            'estado' => 'cancelada',
            'fecha_fin' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Suscripción cancelada exitosamente',
        ]);
    }
}
