<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ZoomService
{
    protected $apiKey;
    protected $apiSecret;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.zoom.api_key');
        $this->apiSecret = config('services.zoom.api_secret');
        $this->baseUrl = config('services.zoom.base_url', 'https://api.zoom.us/v2');
    }

    /**
     * Crear una reunión de Zoom
     * 
     * @param array $data Datos de la reunión (topic, start_time, duration, etc.)
     * @return array|null Información de la reunión creada o null en caso de error
     */
    public function createMeeting(array $data)
    {
        try {
            $token = $this->generateJWT();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/users/me/meetings', [
                'topic' => $data['topic'] ?? 'NutriSystem Session',
                'type' => 2, // Scheduled meeting
                'start_time' => $data['start_time'] ?? now()->toIso8601String(),
                'duration' => $data['duration'] ?? 60,
                'timezone' => $data['timezone'] ?? 'America/Mexico_City',
                'settings' => [
                    'host_video' => true,
                    'participant_video' => true,
                    'join_before_host' => false,
                    'mute_upon_entry' => false,
                    'watermark' => false,
                    'audio' => 'both',
                    'auto_recording' => 'none',
                    'waiting_room' => false,
                ],
            ]);

            if ($response->successful()) {
                $meetingData = $response->json();
                
                Log::info('Zoom meeting created successfully', [
                    'meeting_id' => $meetingData['id'] ?? null,
                    'topic' => $data['topic'] ?? 'NutriSystem Session'
                ]);

                return [
                    'meeting_id' => $meetingData['id'],
                    'meeting_password' => $meetingData['password'] ?? null,
                    'join_url' => $meetingData['join_url'],
                    'start_url' => $meetingData['start_url'],
                    'host_email' => $meetingData['host_email'] ?? null,
                ];
            }

            Log::error('Failed to create Zoom meeting', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Exception creating Zoom meeting', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    /**
     * Obtener información de una reunión
     * 
     * @param string $meetingId ID de la reunión de Zoom
     * @return array|null Información de la reunión o null en caso de error
     */
    public function getMeeting(string $meetingId)
    {
        try {
            $token = $this->generateJWT();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->get($this->baseUrl . '/meetings/' . $meetingId);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to get Zoom meeting', [
                'meeting_id' => $meetingId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Exception getting Zoom meeting', [
                'meeting_id' => $meetingId,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Finalizar una reunión de Zoom
     * 
     * @param string $meetingId ID de la reunión de Zoom
     * @return bool True si se finalizó correctamente, false en caso contrario
     */
    public function endMeeting(string $meetingId)
    {
        try {
            $token = $this->generateJWT();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->put($this->baseUrl . '/meetings/' . $meetingId . '/status', [
                'action' => 'end'
            ]);

            if ($response->successful()) {
                Log::info('Zoom meeting ended successfully', [
                    'meeting_id' => $meetingId
                ]);

                return true;
            }

            Log::error('Failed to end Zoom meeting', [
                'meeting_id' => $meetingId,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Exception ending Zoom meeting', [
                'meeting_id' => $meetingId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Obtener el estado de una reunión
     * 
     * @param string $meetingId ID de la reunión de Zoom
     * @return string|null Estado de la reunión ('waiting', 'started', 'finished') o null en caso de error
     */
    public function getMeetingStatus(string $meetingId)
    {
        try {
            $meetingInfo = $this->getMeeting($meetingId);
            
            if (!$meetingInfo) {
                return null;
            }

            // Determinar el estado basado en la información de la reunión
            $status = $meetingInfo['status'] ?? null;
            
            return $status;

        } catch (\Exception $e) {
            Log::error('Exception getting Zoom meeting status', [
                'meeting_id' => $meetingId,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Generar JWT token para autenticación con Zoom API
     * 
     * @return string JWT token
     */
    protected function generateJWT()
    {
        // Si no hay credenciales configuradas, retornar un token vacío
        if (!$this->apiKey || !$this->apiSecret) {
            Log::warning('Zoom API credentials not configured');
            return '';
        }

        // Verificar si hay un token en caché
        $cacheKey = 'zoom_jwt_token';
        $cachedToken = Cache::get($cacheKey);
        
        if ($cachedToken) {
            return $cachedToken;
        }

        // Generar nuevo token JWT
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $payload = [
            'iss' => $this->apiKey,
            'exp' => time() + 3600, // Token válido por 1 hora
        ];

        $base64UrlHeader = $this->base64UrlEncode(json_encode($header));
        $base64UrlPayload = $this->base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . '.' . $base64UrlPayload,
            $this->apiSecret,
            true
        );
        
        $base64UrlSignature = $this->base64UrlEncode($signature);
        
        $jwt = $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;

        // Cachear el token por 50 minutos (antes de que expire)
        Cache::put($cacheKey, $jwt, now()->addMinutes(50));

        return $jwt;
    }

    /**
     * Codificar en base64 URL-safe
     * 
     * @param string $data Datos a codificar
     * @return string Datos codificados
     */
    protected function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Verificar si las credenciales de Zoom están configuradas
     * 
     * @return bool True si están configuradas, false en caso contrario
     */
    public function isConfigured()
    {
        return !empty($this->apiKey) && !empty($this->apiSecret);
    }
}
