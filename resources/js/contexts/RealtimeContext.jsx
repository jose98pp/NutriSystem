import { createContext, useContext, useEffect, useState } from 'react';
import echo from '../services/echo';
import { useToast } from '../components/Toast';
import axios from 'axios';
import { logApiError } from '../utils/logger';

const RealtimeContext = createContext();

export function RealtimeProvider({ children, user }) {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [presences, setPresences] = useState({});
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) return;

        console.log('Connecting to WebSocket for user:', user.id);

        // Suscribirse al canal privado del usuario
        const channel = echo.private(`user.${user.id}`);

        // Escuchar notificaciones
        channel.listen('.notification.created', (e) => {
            console.log('Notification received:', e);
            setNotifications(prev => [e.notification, ...prev]);
            
            // Mostrar toast
            showToast(e.notification.titulo, e.notification.tipo);
            
            // Actualizar contador de notificaciones
            window.dispatchEvent(new CustomEvent('notification-received'));
        });

        // Escuchar actualizaciones de plan
        channel.listen('.plan.updated', (e) => {
            console.log('Plan updated:', e);
            showToast('Plan actualizado', 'info');
            
            // Trigger re-fetch del plan
            window.dispatchEvent(new CustomEvent('plan-updated', { detail: e }));
        });

        // Escuchar cambios de preferencias
        // Task 19: Implementar sincronización de tema en Web
        channel.listen('.preferences.updated', (e) => {
            console.log('Preferences updated:', e);
            
            // Aplicar cambios de tema
            if (e.preferencias?.theme || e.preferences?.theme) {
                const theme = e.preferencias?.theme || e.preferences?.theme;
                window.dispatchEvent(new CustomEvent('theme-updated', { 
                    detail: { theme } 
                }));
            }
        });

        // Escuchar ingestas creadas
        // Task 20: Implementar sincronización de ingestas
        channel.listen('.ingesta.created', (e) => {
            console.log('Ingesta created:', e);
            showToast('Nueva ingesta registrada', 'success');
            
            // Trigger dashboard refresh
            window.dispatchEvent(new CustomEvent('ingesta-created', { detail: e }));
        });

        // Escuchar archivos subidos
        // Task 22: Implementar sincronización de archivos
        channel.listen('.file.uploaded', (e) => {
            console.log('File uploaded:', e);
            
            if (e.file_type === 'profile_photo') {
                showToast('Foto de perfil actualizada', 'success');
                
                // Trigger profile photo refresh
                window.dispatchEvent(new CustomEvent('profile-photo-updated', { 
                    detail: { 
                        file_url: e.file_url,
                        metadata: e.metadata 
                    } 
                }));
            } else if (e.file_type === 'meal_photo') {
                showToast('Foto de comida subida', 'success');
                
                // Trigger meal photo refresh
                window.dispatchEvent(new CustomEvent('meal-photo-uploaded', { 
                    detail: { 
                        file_url: e.file_url,
                        metadata: e.metadata 
                    } 
                }));
            }
        });

        // Estado de conexión
        echo.connector.pusher.connection.bind('connected', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            const updateOnline = async () => {
                try {
                    await axios.post('/api/presence/status', {
                        status: 'online',
                        socket_id: echo.socketId(),
                    });
                } catch (error) {
                    logApiError('/api/presence/status', error, { status: 'online' });
                }
            };
            updateOnline();
        });

        echo.connector.pusher.connection.bind('disconnected', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        echo.connector.pusher.connection.bind('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Listen to presence updates
        const presenceChannel = echo.channel('presence');
        
        presenceChannel.listen('.user.online', (e) => {
            console.log('User online:', e);
            setPresences(prev => ({
                ...prev,
                [e.user_id]: {
                    user_id: e.user_id,
                    name: e.name,
                    foto_perfil: e.foto_perfil,
                    status: 'online',
                    is_online: true,
                },
            }));
        });

        presenceChannel.listen('.user.offline', (e) => {
            console.log('User offline:', e);
            setPresences(prev => ({
                ...prev,
                [e.user_id]: {
                    ...prev[e.user_id],
                    status: 'offline',
                    is_online: false,
                    last_seen_at: e.last_seen_at,
                },
            }));
        });

            // Mark as away after 5 minutes of inactivity
            let inactivityTimer;
            const resetTimer = () => {
                clearTimeout(inactivityTimer);
                inactivityTimer = setTimeout(() => {
                axios.post('/api/presence/away').catch(err => {
                    logApiError('/api/presence/away', err);
                });
                }, 5 * 60 * 1000); // 5 minutes
            };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            const updateOffline = async () => {
                try {
                    await axios.post('/api/presence/status', {
                        status: 'offline',
                    });
                } catch (error) {
                    logApiError('/api/presence/status', error, { status: 'offline' });
                }
            };
            updateOffline();
            
            echo.leave(`user.${user.id}`);
            echo.leave('presence');
            
            clearTimeout(inactivityTimer);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [user]);

    return (
        <RealtimeContext.Provider value={{ isConnected, notifications, presences }}>
            {children}
        </RealtimeContext.Provider>
    );
}

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider');
    }
    return context;
};
