import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, Package, Utensils, Calendar } from 'lucide-react';
import api from '../config/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showDropdown) {
            fetchNotifications();
        }
    }, [showDropdown]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notificaciones/no-leidas/contar');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error al obtener contador de notificaciones:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notificaciones?per_page=10');
            setNotifications(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    const getNotificationIcon = (tipo, titulo) => {
        // Iconos específicos según el contenido
        if (titulo?.toLowerCase().includes('entrega') || titulo?.toLowerCase().includes('pedido')) {
            return <Package className="w-5 h-5 text-blue-600" />;
        }
        if (titulo?.toLowerCase().includes('comida') || titulo?.toLowerCase().includes('menú')) {
            return <Utensils className="w-5 h-5 text-orange-600" />;
        }
        if (titulo?.toLowerCase().includes('cita') || titulo?.toLowerCase().includes('calendario')) {
            return <Calendar className="w-5 h-5 text-purple-600" />;
        }
        
        // Iconos por tipo
        const icons = {
            info: <Bell className="w-5 h-5 text-blue-600" />,
            success: <Check className="w-5 h-5 text-green-600" />,
            warning: <Clock className="w-5 h-5 text-yellow-600" />,
            error: <Clock className="w-5 h-5 text-red-600" />
        };
        return icons[tipo] || <Bell className="w-5 h-5 text-gray-600" />;
    };

    const getNotificationColor = (tipo) => {
        const colors = {
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        };
        return colors[tipo] || 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    };

    const handleNotificationClick = (notif) => {
        // Marcar como leída
        if (!notif.leida) {
            markAsRead(notif.id_notificacion);
        }
        
        // Navegar si tiene link
        if (notif.link) {
            setShowDropdown(false);
            navigate(notif.link);
        }
    };

    return (
        <div 
            className="relative group" 
            ref={dropdownRef}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
        >
            {/* Botón de Campana */}
            <button
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
                <Bell className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${unreadCount > 0 ? 'animate-pulse' : ''} group-hover:scale-110`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                title="Marcar todas como leídas"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Leer todas</span>
                            </button>
                        )}
                    </div>

                    {/* Lista de Notificaciones */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                                <p className="mt-2 text-sm">Cargando...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p className="font-medium">No tienes notificaciones</p>
                                <p className="text-xs mt-1">Te avisaremos cuando haya algo nuevo</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id_notificacion}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group ${
                                        !notif.leida ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                            {getNotificationIcon(notif.tipo, notif.titulo)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {notif.titulo}
                                                </p>
                                                {!notif.leida && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notif.id_notificacion);
                                                        }}
                                                        className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 ml-2 transition-colors"
                                                        title="Marcar como leída"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                                {notif.mensaje}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>
                                                        {new Date(notif.created_at).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                {notif.link && (
                                                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                                                        Ver detalles →
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                            <Link
                                to="/notificaciones"
                                onClick={() => setShowDropdown(false)}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium inline-flex items-center gap-1 transition-colors"
                            >
                                Ver todas las notificaciones
                                <span>→</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
