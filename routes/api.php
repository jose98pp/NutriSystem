<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\NutricionistaController;
use App\Http\Controllers\Api\AlimentoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\ContratoController;
use App\Http\Controllers\Api\PlanAlimentacionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\IngestaController;
use App\Http\Controllers\Api\EvaluacionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProgressPhotoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DireccionController;
use App\Http\Controllers\Api\RecetaController;
use App\Http\Controllers\Api\AnalisisClinicoController;
use App\Http\Controllers\Api\CalendarioEntregaController;
use App\Http\Controllers\Api\PsicologoController;
use App\Http\Controllers\Api\EntregaProgramadaController;
use App\Http\Controllers\Api\MenuSemanalController;
use App\Http\Controllers\Api\PlanAlimentacionMejoradoController;
use App\Http\Controllers\Api\EjercicioController;
use App\Http\Controllers\Api\GrupoMuscularController;
use App\Http\Controllers\Api\VideollamadaController;
use App\Http\Controllers\Api\NutritionalAnalysisController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/register', [\App\Http\Controllers\Api\RegisterController::class, 'register']);
Route::post('/verify-email', [\App\Http\Controllers\Api\RegisterController::class, 'verifyEmail']);
Route::post('/resend-verification', [\App\Http\Controllers\Api\RegisterController::class, 'resendVerification']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/oauth/google/token-login', [AuthController::class, 'googleTokenLogin']);
Route::get('nutricionistas-disponibles', [NutricionistaController::class, 'index']);
Route::get('servicios-disponibles', [ServicioController::class, 'index']);

// Recuperación de contraseña
Route::post('/forgot-password', [\App\Http\Controllers\Api\PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [\App\Http\Controllers\Api\PasswordResetController::class, 'resetPassword']);
Route::post('/verify-reset-token', [\App\Http\Controllers\Api\PasswordResetController::class, 'verifyToken']);

// Zoom Webhooks (público para que Zoom pueda llamarlo)
Route::post('/videollamadas/webhook', [\App\Http\Controllers\Api\ZoomWebhookController::class, 'handle']);

// Rutas protegidas con Sanctum - Comunes para todos los roles autenticados
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    // Perfil
    Route::get('/perfil', [ProfileController::class, 'show']);
    Route::put('/perfil', [ProfileController::class, 'update']);
    Route::post('/perfil/foto', [ProfileController::class, 'uploadPhoto']);
    Route::delete('/perfil/foto', [ProfileController::class, 'deletePhoto']);
    Route::put('/perfil/password', [ProfileController::class, 'changePassword']);
    Route::put('/perfil/preferencias', [ProfileController::class, 'updatePreferences']);
    Route::put('/perfil/notificaciones', [ProfileController::class, 'updateNotifications']);
    
    // Notificaciones (todos los roles)
    Route::get('notificaciones', [NotificationController::class, 'index']);
    Route::post('notificaciones', [NotificationController::class, 'store']);
    Route::put('notificaciones/{id}/leer', [NotificationController::class, 'markAsRead']);
    Route::put('notificaciones/leer-todas', [NotificationController::class, 'markAllAsRead']);
    Route::get('notificaciones/no-leidas/contar', [NotificationController::class, 'countUnread']);
    Route::delete('notificaciones/{id}', [NotificationController::class, 'destroy']);
    
    // Mensajes (todos los roles)
    Route::get('mensajes/conversaciones', [MessageController::class, 'conversations']);
    Route::get('mensajes/conversacion/{userId}', [MessageController::class, 'getConversation']);
    Route::post('mensajes', [MessageController::class, 'store']);
    Route::put('mensajes/{id}', [MessageController::class, 'update']);
    Route::delete('mensajes/{id}', [MessageController::class, 'destroy']);
    Route::put('mensajes/{id}/leer', [MessageController::class, 'markAsRead']);
    Route::get('mensajes/no-leidos/contar', [MessageController::class, 'countUnread']);
    Route::get('mensajes/usuarios/buscar', [MessageController::class, 'searchUsers']);
    
    // Fotos de Progreso (todos los roles)
    Route::get('fotos-progreso', [ProgressPhotoController::class, 'index']);
    Route::post('fotos-progreso', [ProgressPhotoController::class, 'store']);
    Route::get('fotos-progreso/{id}', [ProgressPhotoController::class, 'show']);
    Route::post('fotos-progreso/{id}', [ProgressPhotoController::class, 'update']);
    Route::delete('fotos-progreso/{id}', [ProgressPhotoController::class, 'destroy']);
    Route::get('fotos-progreso/paciente/{pacienteId}', [ProgressPhotoController::class, 'getFotosPaciente']);
    Route::get('fotos-progreso/comparacion/{pacienteId}', [ProgressPhotoController::class, 'comparacion']);
    Route::get('fotos-progreso/timeline/{pacienteId}', [ProgressPhotoController::class, 'timeline']);
    
    // Ingestas (todos los roles)
    Route::apiResource('ingestas', IngestaController::class);
    Route::get('ingestas/historial/{paciente_id}', [IngestaController::class, 'historial']);
    
    // Alimentos (lectura para todos, escritura solo admin/nutricionista)
    Route::get('alimentos', [AlimentoController::class, 'index']);
    Route::get('alimentos/{id}', [AlimentoController::class, 'show']);

    // Ejercicios (lectura para todos los roles autenticados)
    Route::get('ejercicios', [EjercicioController::class, 'index']);
    Route::get('ejercicios/{id}', [EjercicioController::class, 'show']);
    Route::get('modelo-anatomico', [GrupoMuscularController::class, 'modeloAnatomico']);

    // Presencia y tiempo real (todos los roles autenticados)
    Route::post('presence/status', [\App\Http\Controllers\Api\PresenceController::class, 'updateStatus']);
    Route::post('presence/typing', [\App\Http\Controllers\Api\PresenceController::class, 'typing']);
    Route::post('presence/get', [\App\Http\Controllers\Api\PresenceController::class, 'getPresence']);

    // Autorización de canales de broadcasting vía token (evita CSRF)
    Route::post('broadcasting/auth', [\Illuminate\Broadcasting\BroadcastController::class, 'authenticate']);

    // Videollamadas (todos los roles autenticados, permiso validado en controlador)
    Route::get('videollamada/{id}/token', [VideollamadaController::class, 'getToken']);
    Route::get('videollamada/{id}/verificar', [VideollamadaController::class, 'verificar']);
    Route::post('videollamada/{id}/join', [VideollamadaController::class, 'join']);
    Route::post('videollamada/{id}/participante-unido', [VideollamadaController::class, 'participanteUnido']);
    Route::post('videollamada/{id}/finalizar', [VideollamadaController::class, 'finalizar']);
    Route::post('videollamada/crear', [VideollamadaController::class, 'crear']);
});

// Rutas exclusivas para Admin y Nutricionista
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    
    // Pacientes
    Route::apiResource('pacientes', PacienteController::class);
    
    // Nutricionistas - Lectura para admin y nutricionista, escritura solo admin
    Route::get('nutricionistas', [NutricionistaController::class, 'index']);
    Route::get('nutricionistas/{id}', [NutricionistaController::class, 'show']);

    // Psicólogos - Lectura para admin y nutricionista
    Route::get('psicologos', [PsicologoController::class, 'index']);
    Route::get('psicologos/{id}', [PsicologoController::class, 'show']);
    
    // Contratos - CRUD completo para admin y nutricionista
    Route::get('contratos', [ContratoController::class, 'index']);
    Route::post('contratos', [ContratoController::class, 'store']);
    Route::get('contratos/{id}', [ContratoController::class, 'show']);
    Route::put('contratos/{id}', [ContratoController::class, 'update']);
    Route::delete('contratos/{id}', [ContratoController::class, 'destroy']);
    Route::get('contratos/paciente/{paciente_id}', [ContratoController::class, 'getByPaciente']);
    Route::get('contratos/estado/{estado}', [ContratoController::class, 'getByEstado']);
    
    // Cancelar contrato - Admin y Nutricionista
    Route::put('contratos/{id}/cancelar', [ContratoController::class, 'cancelar']);
    
    // Planes de Alimentación - CRUD para admin y nutricionista
    Route::get('planes', [PlanAlimentacionController::class, 'index']);
    Route::post('planes', [PlanAlimentacionController::class, 'store']);
    Route::get('planes/{id}', [PlanAlimentacionController::class, 'show']);
    Route::put('planes/{id}', [PlanAlimentacionController::class, 'update']);
    Route::delete('planes/{id}', [PlanAlimentacionController::class, 'destroy']);
    Route::patch('planes/{id}/toggle-status', [PlanAlimentacionController::class, 'toggleStatus']);
    
    // Gestión de opciones de comidas (máximo 2 por turno)
    Route::post('planes/{planId}/dias/{diaId}/opciones', [PlanAlimentacionController::class, 'agregarOpcionComida']);
    Route::get('planes/{planId}/dias/{diaId}/opciones/{tipoComida}', [PlanAlimentacionController::class, 'obtenerOpcionesComida']);
    Route::delete('planes/{planId}/dias/{diaId}/opciones/{comidaId}', [PlanAlimentacionController::class, 'eliminarOpcionComida']);
    Route::put('planes/{planId}/dias/{diaId}/opciones/{tipoComida}/reordenar', [PlanAlimentacionController::class, 'reordenarOpciones']);
    
    // Planes de Alimentación Mejorados
    Route::get('planes-mejorados', [PlanAlimentacionMejoradoController::class, 'index']);
    Route::post('planes-mejorados', [PlanAlimentacionMejoradoController::class, 'store']);
    Route::get('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'show']);
    Route::put('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'update']);
    Route::delete('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'destroy']);
    Route::post('planes-mejorados/{id}/duplicar', [PlanAlimentacionMejoradoController::class, 'duplicar']);
    
    // Análisis Nutricional - Admin y Nutricionista
    Route::get('analisis-nutricional/comida/{comidaId}', [NutritionalAnalysisController::class, 'analizarComida']);
    Route::get('analisis-nutricional/dia/{diaId}', [NutritionalAnalysisController::class, 'analizarDia']);
    Route::get('analisis-nutricional/plan/{planId}', [NutritionalAnalysisController::class, 'analizarPlan']);
    Route::post('analisis-nutricional/plan/{planId}/comparar-objetivos', [NutritionalAnalysisController::class, 'compararConObjetivos']);
    Route::post('analisis-nutricional/plan/{planId}/reporte', [NutritionalAnalysisController::class, 'generarReporte']);
    Route::get('analisis-nutricional/plan/{planId}/resumen', [NutritionalAnalysisController::class, 'resumenNutricional']);
    
    // Servicios - Lectura para admin y nutricionista
    Route::get('servicios', [ServicioController::class, 'index']);
    Route::get('servicios/{id}', [ServicioController::class, 'show']);
    
    // Evaluaciones - CRUD completo para admin y nutricionista
    Route::get('evaluaciones', [EvaluacionController::class, 'index']);
    Route::post('evaluaciones', [EvaluacionController::class, 'store']);
    Route::get('evaluaciones/{id}', [EvaluacionController::class, 'show']);
    Route::put('evaluaciones/{id}', [EvaluacionController::class, 'update']);
    Route::delete('evaluaciones/{id}', [EvaluacionController::class, 'destroy']);
    Route::get('evaluaciones/historial/{paciente_id}', [EvaluacionController::class, 'historialPaciente']);
    Route::get('evaluaciones-pacientes', [EvaluacionController::class, 'getPacientesNutricionista']);
    
    // Calendarios de Entrega - Admin y Nutricionista
    Route::apiResource('calendarios-entrega', CalendarioEntregaController::class);
    Route::get('calendarios-entrega/contrato/{id_contrato}', [CalendarioEntregaController::class, 'byContrato']);
    Route::get('calendarios-entrega-activos', [CalendarioEntregaController::class, 'activos']);
    
    // Entregas Programadas - Admin y Nutricionista
    Route::apiResource('entregas-programadas', EntregaProgramadaController::class);
    Route::put('entregas-programadas/{id}/marcar-entregada', [EntregaProgramadaController::class, 'marcarComoEntregada']);
    Route::put('entregas-programadas/{id}/marcar-omitida', [EntregaProgramadaController::class, 'marcarComoOmitida']);
    Route::get('entregas-del-dia', [EntregaProgramadaController::class, 'entregasDelDia']);
    Route::get('entregas-pendientes', [EntregaProgramadaController::class, 'entregasPendientes']);
    Route::post('entregas-programadas/generar/{id_calendario}', [EntregaProgramadaController::class, 'generarEntregas']);
    
    // Recetas - Admin y Nutricionista
    Route::apiResource('recetas', RecetaController::class);
    Route::post('recetas/{id}/agregar-comida', [RecetaController::class, 'attachToComida']);
    Route::delete('recetas/{id}/remover-comida/{id_comida}', [RecetaController::class, 'detachFromComida']);
    
    // Análisis Clínicos - Admin y Nutricionista
    Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
    Route::post('analisis-clinicos/{id}/vincular-evaluacion', [AnalisisClinicoController::class, 'attachToEvaluacion']);
    Route::delete('analisis-clinicos/{id}/desvincular-evaluacion/{id_evaluacion}', [AnalisisClinicoController::class, 'detachFromEvaluacion']);
    
    // Direcciones - Admin y Nutricionista
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('direcciones/paciente/{id_paciente}', [DireccionController::class, 'byPaciente']);
});

// Rutas exclusivas para Admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Nutricionistas - Gestión completa solo para admin
    Route::post('nutricionistas', [NutricionistaController::class, 'store']);
    Route::put('nutricionistas/{id}', [NutricionistaController::class, 'update']);
    Route::delete('nutricionistas/{id}', [NutricionistaController::class, 'destroy']);

    // Psicólogos - Gestión completa solo para admin
    Route::post('psicologos', [PsicologoController::class, 'store']);
    Route::put('psicologos/{id}', [PsicologoController::class, 'update']);
    Route::delete('psicologos/{id}', [PsicologoController::class, 'destroy']);
    
    // Alimentos (solo escritura para admin/nutricionista)
    Route::post('alimentos', [AlimentoController::class, 'store']);
    Route::put('alimentos/{id}', [AlimentoController::class, 'update']);
    Route::delete('alimentos/{id}', [AlimentoController::class, 'destroy']);
    
    // Servicios - Escritura solo para admin
    Route::post('servicios', [ServicioController::class, 'store']);
    Route::put('servicios/{id}', [ServicioController::class, 'update']);
    Route::delete('servicios/{id}', [ServicioController::class, 'destroy']);

    // Ejercicios - Gestión completa solo para admin
    Route::post('ejercicios', [EjercicioController::class, 'store']);
    Route::put('ejercicios/{id}', [EjercicioController::class, 'update']);
    Route::delete('ejercicios/{id}', [EjercicioController::class, 'destroy']);
});

// Rutas exclusivas para Pacientes
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    
    // Mi Plan de Alimentación (solo lectura)
    Route::get('mi-plan', [PlanAlimentacionController::class, 'miPlan']);
    Route::get('mi-plan/{id}', [PlanAlimentacionController::class, 'show']);
    
    // Mis Direcciones (solo lectura)
    Route::get('mis-direcciones', [DireccionController::class, 'misDirecciones']);
    
    // Mis Recetas (solo del plan activo)
    Route::get('mis-recetas', [RecetaController::class, 'misRecetas']);
    
    // Mis Análisis Clínicos
    Route::get('mis-analisis', [AnalisisClinicoController::class, 'misAnalisis']);
    
    // Mi Calendario de Entrega
    Route::get('mi-calendario', [CalendarioEntregaController::class, 'miCalendario']);
    
    // Mis Entregas
    Route::get('mis-entregas', [EntregaProgramadaController::class, 'misEntregas']);
    
    // Mi Menú Semanal
    Route::get('mi-menu-semanal', [MenuSemanalController::class, 'getMiMenuSemanal']);
    Route::get('menu-del-dia', [MenuSemanalController::class, 'menuDelDia']);
    
    // Mis Entregas
    Route::get('mis-entregas/proximas', [EntregaProgramadaController::class, 'proximasEntregas']);
    
    // Mis Comidas de Hoy
    Route::get('progreso-del-dia', [IngestaController::class, 'progresoDelDia']);
    Route::post('registrar-rapido', [IngestaController::class, 'registrarRapido']);

    Route::get('sesiones-entrenamiento', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'index']);
    Route::get('sesiones-entrenamiento/estadisticas', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'estadisticas']);
    Route::get('sesiones-entrenamiento/{id}', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'show']);
    Route::post('sesiones-entrenamiento', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'store']);
    Route::put('sesiones-entrenamiento/{id}', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'update']);
    Route::post('sesiones-entrenamiento/{id}/completar', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'marcarCompletada']);
    Route::post('sesiones-entrenamiento/sincronizar', [\App\Http\Controllers\Api\SesionEntrenamientoController::class, 'sincronizar']);
    // Onboarding paciente: selección y suscripción
    Route::post('suscripciones', [\App\Http\Controllers\Api\SuscripcionController::class, 'store']);
    Route::get('suscripcion/activa', [\App\Http\Controllers\Api\SuscripcionController::class, 'activa']);
    Route::post('mi-nutricionista', [PacienteController::class, 'asignarNutricionista']);
    Route::post('evaluaciones/inicial', [EvaluacionController::class, 'storeInicialPaciente']);
    Route::post('onboarding/finalizar', [AuthController::class, 'finalizeOnboarding']);
});

// Sesiones: Profesionales (admin, nutricionista, psicologo)
Route::middleware(['auth:sanctum', 'role:admin,nutricionista,psicologo'])->group(function () {
    Route::apiResource('sesiones', \App\Http\Controllers\Api\SesionController::class);
    Route::post('sesiones/{id}/iniciar', [\App\Http\Controllers\Api\SesionController::class, 'iniciar']);
    Route::post('sesiones/{id}/completar', [\App\Http\Controllers\Api\SesionController::class, 'completar']);
    Route::post('sesiones/{id}/cancelar', [\App\Http\Controllers\Api\SesionController::class, 'cancelar']);
});

// Sesiones: Pacientes
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    Route::get('mis-sesiones', [\App\Http\Controllers\Api\SesionController::class, 'misSesiones']);
    Route::get('proximas-sesiones', [\App\Http\Controllers\Api\SesionController::class, 'proximasSesiones']);
});

    // Análisis Nutricional
    Route::get('analisis-nutricional/comida/{comidaId}', [NutritionalAnalysisController::class, 'analizarComida']);
    Route::get('analisis-nutricional/dia/{diaId}', [NutritionalAnalysisController::class, 'analizarDia']);
    Route::get('analisis-nutricional/plan/{planId}', [NutritionalAnalysisController::class, 'analizarPlan']);
    Route::post('analisis-nutricional/plan/{planId}/comparar-objetivos', [NutritionalAnalysisController::class, 'compararConObjetivos']);
    Route::post('analisis-nutricional/plan/{planId}/reporte', [NutritionalAnalysisController::class, 'generarReporte']);
    Route::get('analisis-nutricional/plan/{planId}/resumen', [NutritionalAnalysisController::class, 'resumenNutricional']);

// Generación automática de recetas (Admin y Nutricionista)
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    Route::post('recetas/generar', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'generateRecipe']);
    Route::post('recetas/generar-paciente/{pacienteId}', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'generateForPatient']);
    Route::post('recetas/generar-variaciones', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'generateVariations']);
    Route::post('recetas/guardar-generada', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'saveGeneratedRecipe']);
    
    // Combinaciones de alimentos
    Route::post('alimentos/combinaciones-optimas', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'findOptimalCombinations']);
    Route::post('alimentos/verificar-compatibilidad', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'checkCompatibility']);
    Route::post('alimentos/sugerir-complementarios', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'suggestComplementary']);
    Route::post('alimentos/optimizar-proporciones', [\App\Http\Controllers\Api\RecetaGeneratorController::class, 'optimizeProportions']);
});
