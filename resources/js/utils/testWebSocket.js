/**
 * Script de prueba para WebSocket
 * 
 * Para usar en la consola del navegador:
 * 1. Abrir DevTools (F12)
 * 2. Ir a la pestaña Console
 * 3. Ejecutar: testWebSocket()
 */

import echo from '../services/echo';

export function testWebSocket() {
    console.log('🔌 Testing WebSocket Connection...');
    console.log('Configuration:', {
        host: import.meta.env.VITE_PUSHER_HOST,
        port: import.meta.env.VITE_PUSHER_PORT,
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    });

    // Verificar estado de conexión
    const connectionState = echo.connector.pusher.connection.state;
    console.log('Connection state:', connectionState);

    // Escuchar eventos de conexión
    echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket connected successfully!');
        console.log('Socket ID:', echo.socketId());
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket disconnected');
    });

    echo.connector.pusher.connection.bind('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });

    // Intentar suscribirse a un canal de prueba
    const userId = localStorage.getItem('user_id');
    if (userId) {
        console.log(`Subscribing to private-user.${userId}...`);
        
        const channel = echo.private(`user.${userId}`);
        
        channel.subscription.bind('pusher:subscription_succeeded', () => {
            console.log('✅ Successfully subscribed to user channel');
        });

        channel.subscription.bind('pusher:subscription_error', (error) => {
            console.error('❌ Subscription error:', error);
        });

        // Escuchar eventos de prueba
        channel.listen('.notification.created', (e) => {
            console.log('📬 Notification received:', e);
        });

        channel.listen('.plan.updated', (e) => {
            console.log('📋 Plan updated:', e);
        });

        console.log('Listening for events on user channel...');
    } else {
        console.warn('⚠️  No user_id found in localStorage. Please login first.');
    }

    return {
        echo,
        connectionState,
        socketId: echo.socketId(),
        disconnect: () => echo.disconnect(),
        reconnect: () => echo.connector.pusher.connect(),
    };
}

// Hacer disponible globalmente en desarrollo
if (import.meta.env.DEV) {
    window.testWebSocket = testWebSocket;
    console.log('💡 WebSocket test available: testWebSocket()');
}

export default testWebSocket;
