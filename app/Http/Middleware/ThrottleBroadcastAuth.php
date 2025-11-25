<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ThrottleBroadcastAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = 'broadcast-auth:' . ($request->user()?->id ?? $request->ip());
        
        // Permitir 60 intentos de autenticación por minuto
        if (RateLimiter::tooManyAttempts($key, 60)) {
            return response()->json([
                'message' => 'Too many authentication attempts. Please try again later.'
            ], 429);
        }
        
        RateLimiter::hit($key, 60);
        
        return $next($request);
    }
}
