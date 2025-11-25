import axios from 'axios';
import { logApiError, logDebug, logWarn } from '../utils/logger';

const apiBase = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000');
const needsIndex = apiBase.includes('/Nutricion/public');
const api = axios.create({
    baseURL: apiBase + (needsIndex ? '/index.php/api' : '/api'),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log de debug para desarrollo
        logDebug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        logApiError('Request Error', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación y logging
api.interceptors.response.use(
    (response) => {
        // Log de debug para desarrollo
        logDebug(`API Response: ${response.status} ${response.config.url}`, {
            status: response.status,
            data: response.data
        });
        
        return response;
    },
    (error) => {
        const endpoint = error.config?.url || 'unknown';
        
        // Determinar el tipo de error para mejor logging
        let errorType = 'Unknown Error';
        let errorDetails = {};
        
        if (!error.response) {
            // Error de red - servidor no responde
            errorType = 'Network Error';
            errorDetails = {
                message: 'No se pudo conectar con el servidor',
                code: error.code,
                possibleCauses: [
                    'Servidor no está corriendo',
                    'URL de API incorrecta',
                    'Problema de red o firewall',
                    'CORS no configurado'
                ],
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                    timeout: error.config?.timeout
                }
            };
            
            // Mostrar error más descriptivo en consola
            console.error('❌ Error de Conexión:', {
                endpoint,
                baseURL: error.config?.baseURL,
                fullURL: error.config?.baseURL + endpoint,
                message: 'No se pudo conectar con el servidor. Verifica que el servidor Laravel esté corriendo.'
            });
        } else {
            // Error con respuesta del servidor
            errorDetails = {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            };
        }
        
        // Log del error con detalles mejorados
        logApiError(endpoint, { ...error, errorType, errorDetails }, error.config?.data);
        
        // Manejar diferentes tipos de errores
        if (error.response?.status === 401) {
            logWarn('Unauthorized access, redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Solo redirigir si no estamos ya en login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            logWarn('Forbidden access attempt', { endpoint });
        } else if (error.response?.status >= 500) {
            logWarn('Server error detected', { 
                status: error.response.status,
                endpoint 
            });
        } else if (error.code === 'ECONNABORTED') {
            logWarn('Request timeout', { endpoint });
        } else if (!error.response) {
            logWarn('Network error - no response received', { 
                endpoint,
                baseURL: error.config?.baseURL,
                suggestion: 'Verifica que el servidor esté corriendo en ' + error.config?.baseURL
            });
        }
        
        return Promise.reject(error);
    }
);

export default api;
