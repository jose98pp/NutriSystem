import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../config/api';

/**
 * Hook personalizado para gestionar notificaciones
 * 
 * Características:
 * - Obtiene notificaciones del usuario
 * - Cuenta notificaciones no leídas
 * - Marca notificaciones como leídas
 * - Elimina notificaciones
 * - Polling automático cada 30 segundos
 * - Pausa el polling cuando el tab no está visible
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const pollingIntervalRef = useRef(null);
    const isPollingActiveRef = useRef(true);

    /**
     * Obtener notificaciones del servidor
     */
    const fetchNotifications = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get('/notificaciones', { params });
            
            if (response.data) {
                // Si es paginado
                if (response.data.data) {
                    setNotifications(response.data.data);
                } else {
                    setNotifications(response.data);
                }
            }
        } catch (err) {
            console.error('Error al obtener notificaciones:', err);
            setError(err.response?.data?.message || 'Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener contador de notificaciones no leídas
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/notificaciones/no-leidas/contar');
            setUnreadCount(response.data.count || 0);
        } catch (err) {
            console.error('Error al obtener contador de no leídas:', err);
            // No mostramos error al usuario para no ser intrusivos
        }
    }, []);

    /**
     * Marcar una notificación como leída
     */
    const markAsRead = useCallback(async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            
            // Actualizar estado local
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id_notificacion === id 
                        ? { ...notif, leida: true }
                        : notif
                )
            );
            
            // Actualizar contador
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            return true;
        } catch (err) {
            console.error('Error al marcar como leída:', err);
            setError(err.response?.data?.message || 'Error al marcar como leída');
            return false;
        }
    }, []);

    /**
     * Marcar todas las notificaciones como leídas
     */
    const markAllAsRead = useCallback(async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            
            // Actualizar estado local
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, leida: true }))
            );
            
            setUnreadCount(0);
            
            return true;
        } catch (err) {
            console.error('Error al marcar todas como leídas:', err);
            setError(err.response?.data?.message || 'Error al marcar todas como leídas');
            return false;
        }
    }, []);

    /**
     * Eliminar una notificación
     */
    const deleteNotification = useCallback(async (id) => {
        try {
            await api.delete(`/notificaciones/${id}`);
            
            // Actualizar estado local
            const deletedNotif = notifications.find(n => n.id_notificacion === id);
            setNotifications(prev => 
                prev.filter(notif => notif.id_notificacion !== id)
            );
            
            // Si era no leída, actualizar contador
            if (deletedNotif && !deletedNotif.leida) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            
            return true;
        } catch (err) {
            console.error('Error al eliminar notificación:', err);
            setError(err.response?.data?.message || 'Error al eliminar notificación');
            return false;
        }
    }, [notifications]);

    /**
     * Iniciar polling automático
     */
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            return; // Ya está activo
        }

        // Polling cada 30 segundos
        pollingIntervalRef.current = setInterval(() => {
            if (isPollingActiveRef.current && document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        }, 30000);
    }, [fetchUnreadCount]);

    /**
     * Detener polling
     */
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    /**
     * Manejar cambios de visibilidad del tab
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Tab visible: actualizar contador
                fetchUnreadCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchUnreadCount]);

    /**
     * Inicializar: obtener contador y comenzar polling
     */
    useEffect(() => {
        fetchUnreadCount();
        startPolling();

        return () => {
            stopPolling();
        };
    }, [fetchUnreadCount, startPolling, stopPolling]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        startPolling,
        stopPolling,
    };
};

export default useNotifications;
