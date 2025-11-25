/**
 * Sistema de logging controlado para producción
 */

// Niveles de log
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Configuración basada en el entorno
const isDevelopment = import.meta.env.DEV;
const currentLogLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * Logger principal
 */
class Logger {
    constructor() {
        this.level = currentLogLevel;
    }
    
    /**
     * Log de error (siempre se muestra)
     */
    error(message, data = null) {
        if (this.level >= LOG_LEVELS.ERROR) {
            if (isDevelopment) {
                console.error(`[ERROR] ${message}`, data);
            } else {
                // En producción, solo log críticos sin datos sensibles
                console.error(`[ERROR] ${this.sanitizeMessage(message)}`);
                
                // Aquí podrías enviar a un servicio de logging como Sentry
                this.sendToExternalService('error', message, data);
            }
        }
    }
    
    /**
     * Log de advertencia
     */
    warn(message, data = null) {
        if (this.level >= LOG_LEVELS.WARN) {
            if (isDevelopment) {
                console.warn(`[WARN] ${message}`, data);
            }
        }
    }
    
    /**
     * Log de información
     */
    info(message, data = null) {
        if (this.level >= LOG_LEVELS.INFO) {
            if (isDevelopment) {
                console.info(`[INFO] ${message}`, data);
            }
        }
    }
    
    /**
     * Log de debug (solo desarrollo)
     */
    debug(message, data = null) {
        if (this.level >= LOG_LEVELS.DEBUG && isDevelopment) {
            console.debug(`[DEBUG] ${message}`, data);
        }
    }
    
    /**
     * Sanitizar mensajes para producción
     */
    sanitizeMessage(message) {
        // Remover información sensible
        return message
            .replace(/password[=:]\s*[^\s,}]*/gi, 'password=***')
            .replace(/token[=:]\s*[^\s,}]*/gi, 'token=***')
            .replace(/email[=:]\s*[^\s,}]*/gi, 'email=***')
            .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '****-****-****-****'); // Tarjetas
    }
    
    /**
     * Enviar logs críticos a servicio externo
     */
    sendToExternalService(level, message, data) {
        // Implementar integración con Sentry, LogRocket, etc.
        if (window.Sentry) {
            window.Sentry.captureException(new Error(message), {
                level,
                extra: data
            });
        }
    }
    
    /**
     * Log de API errors con contexto
     */
    apiError(endpoint, error, requestData = null) {
        const message = `API Error: ${endpoint}`;
        const errorData = {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            // No incluir requestData en producción por seguridad
            ...(isDevelopment && { requestData })
        };
        
        this.error(message, errorData);
    }
    
    /**
     * Log de eventos de usuario (analytics)
     */
    userEvent(event, properties = {}) {
        if (isDevelopment) {
            this.info(`User Event: ${event}`, properties);
        }
        
        // Enviar a analytics (Google Analytics, Mixpanel, etc.)
        if (window.gtag) {
            window.gtag('event', event, properties);
        }
    }
    
    /**
     * Log de performance
     */
    performance(operation, duration, metadata = {}) {
        if (isDevelopment) {
            this.info(`Performance: ${operation} took ${duration}ms`, metadata);
        }
        
        // Enviar métricas de performance
        if (window.performance && window.performance.mark) {
            window.performance.mark(`${operation}-end`);
        }
    }
}

// Instancia singleton
const logger = new Logger();

// Funciones de conveniencia
export const logError = (message, data) => logger.error(message, data);
export const logWarn = (message, data) => logger.warn(message, data);
export const logInfo = (message, data) => logger.info(message, data);
export const logDebug = (message, data) => logger.debug(message, data);
export const logApiError = (endpoint, error, requestData) => logger.apiError(endpoint, error, requestData);
export const logUserEvent = (event, properties) => logger.userEvent(event, properties);
export const logPerformance = (operation, duration, metadata) => logger.performance(operation, duration, metadata);

export default logger;