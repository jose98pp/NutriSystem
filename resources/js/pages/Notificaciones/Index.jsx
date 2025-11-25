import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Bell, Check, CheckCheck, Trash2, Clock, Package, Utensils, Calendar, Mail, AlertCircle } from 'lucide-react';
import api from '../../config/api';

const NotificacionesIndex = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todas'); // todas, leidas, no_leidas
    const navigate = useNavigate();
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = filter !== 'todas' ? { leida: filter === 'leidas' ? 1 : 0 } : {};
            const response = await api.get('/notificaciones', { params });
            setNotifications(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            toast.error('❌ Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notificaciones/${id}/leer`);
            fetchNotifications();
            toast.success('✅ Notificación marcada como leída');
        } catch (error) {
            console.error('Error al marcar como leída:', error);
            toast.error('❌ Error al actualizar notificación');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notificaciones/leer-todas');
            fetchNotifications();
            toast.success('✅ Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
            toast.error('❌ Error al actualizar notificaciones');
        }
    };

    const deleteNotification = async (id) => {
        const confirmed = await confirm({
            title: 'Eliminar Notificación',
            message: '¿Estás seguro de que deseas eliminar esta notificación?',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/notificaciones/${id}`);
            fetchNotifications();
            toast.success('✅ Notificación eliminada');
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('❌ Error al eliminar notificación');
        }
    };

    const handleNotificationClick = (notif) => {
        // Marcar como leída si no lo está
        if (!notif.leida) {
            markAsRead(notif.id_notificacion);
        }
        
        // Navegar si tiene link
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const getNotificationIcon = (tipo, titulo) => {
        // Iconos específicos según el contenido
        if (titulo?.toLowerCase().includes('entrega') || titulo?.toLowerCase().includes('pedido')) {
            return <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
        }
        if (titulo?.toLowerCase().includes('comida') || titulo?.toLowerCase().includes('menú')) {
            return <Utensils className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
        }
        if (titulo?.toLowerCase().includes('cita') || titulo?.toLowerCase().includes('calendario')) {
            return <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
        }
        if (titulo?.toLowerCase().includes('mensaje')) {
            return <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />;
        }
        
        // Iconos por tipo
        const icons = {
            info: <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            success: <Check className="w-6 h-6 text-green-600 dark:text-green-400" />,
            warning: <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
            error: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        };
        return icons[tipo] || <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
    };

    const getNotificationColor = (tipo) => {
        const colors = {
            info: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600',
            success: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600',
            warning: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600',
            error: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
        };
        return colors[tipo] || 'border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-600';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Notificaciones</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona tus notificaciones</p>
                        </div>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="btn-primary flex items-center gap-2"
                    >
                        <CheckCheck className="w-5 h-5" />
                        Marcar Todas como Leídas
                    </button>
                </div>

                {/* Filtros */}
                <div className="card">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('todas')}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                                filter === 'todas'
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('no_leidas')}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                                filter === 'no_leidas'
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            No Leídas
                        </button>
                        <button
                            onClick={() => setFilter('leidas')}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                                filter === 'leidas'
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Leídas
                        </button>
                    </div>
                </div>

                {/* Lista de Notificaciones */}
                {loading ? (
                    <div className="card text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando notificaciones...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="card text-center py-16">
                        <Bell className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No hay notificaciones</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filter === 'no_leidas' && 'No tienes notificaciones sin leer'}
                            {filter === 'leidas' && 'No tienes notificaciones leídas'}
                            {filter === 'todas' && 'Te avisaremos cuando haya algo nuevo'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id_notificacion}
                                onClick={() => handleNotificationClick(notif)}
                                className={`card ${getNotificationColor(notif.tipo)} ${
                                    !notif.leida ? 'ring-2 ring-primary-300 dark:ring-primary-700' : ''
                                } hover:shadow-lg transition-all cursor-pointer group`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icono */}
                                    <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                        {getNotificationIcon(notif.tipo, notif.titulo)}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {notif.titulo}
                                                {!notif.leida && (
                                                    <span className="ml-2 px-2.5 py-1 text-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-sm">
                                                        Nueva
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {new Date(notif.created_at).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 mb-4">{notif.mensaje}</p>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-3">
                                            {!notif.leida && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.id_notificacion);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors text-sm font-medium"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Marcar como leída
                                                </button>
                                            )}
                                            {notif.link && (
                                                <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                                                    Ver detalles
                                                    <span>→</span>
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notif.id_notificacion);
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NotificacionesIndex;
