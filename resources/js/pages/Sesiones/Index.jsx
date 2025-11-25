import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Calendar, Plus, Video, Clock, Brain, Utensils, Play, CheckCircle, XCircle, Eye, Filter, AlertCircle, Info, Search } from 'lucide-react';
import api from '../../config/api';

const SesionesIndex = () => {
    const [sesiones, setSesiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        estado: 'todos',
        tipo_sesion: 'todos',
        fecha_desde: '',
        fecha_hasta: ''
    });
    const [pagination, setPagination] = useState({});
    const toast = useToast();
    const confirm = useConfirm();

    const fetchSesiones = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([key, value]) => value && value !== 'todos')
                )
            };
            
            const response = await api.get('/sesiones', { params });
            setSesiones(response.data.data || []);
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Error al cargar sesiones:', error);
            toast.error('❌ Error al cargar las sesiones. Por favor, recarga la página.');
            setSesiones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSesiones();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleIniciarSesion = async (id) => {
        try {
            await api.post(`/sesiones/${id}/iniciar`);
            toast.success('✅ Sesión iniciada correctamente');
            fetchSesiones();
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            toast.error('❌ No se pudo iniciar la sesión. Intenta nuevamente.');
        }
    };

    const handleCompletarSesion = async (id) => {
        const confirmed = await confirm({
            title: 'Completar Sesión',
            message: '¿Estás seguro de que deseas marcar esta sesión como completada? Asegúrate de haber registrado todas las notas necesarias.',
            confirmText: 'Sí, completar',
            cancelText: 'No, continuar'
        });

        if (!confirmed) return;

        try {
            await api.post(`/sesiones/${id}/completar`);
            toast.success('✅ Sesión completada exitosamente');
            fetchSesiones();
        } catch (error) {
            console.error('Error al completar sesión:', error);
            toast.error('❌ No se pudo completar la sesión. Verifica que todas las notas estén guardadas.');
        }
    };

    const handleCancelarSesion = async (id) => {
        const confirmed = await confirm({
            title: 'Cancelar Sesión',
            message: '¿Estás seguro de que deseas cancelar esta sesión? Esta acción no se puede deshacer.',
            confirmText: 'Sí, cancelar',
            cancelText: 'No, mantener'
        });

        if (!confirmed) return;

        const motivo = prompt('Por favor, indica el motivo de la cancelación:');
        if (!motivo || motivo.trim() === '') {
            toast.error('⚠️ Debes proporcionar un motivo de cancelación');
            return;
        }

        try {
            await api.post(`/sesiones/${id}/cancelar`, { motivo_cancelacion: motivo });
            toast.success('✅ Sesión cancelada correctamente');
            fetchSesiones();
        } catch (error) {
            console.error('Error al cancelar sesión:', error);
            toast.error('❌ Error al cancelar la sesión');
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'PROGRAMADA': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            'EN_CURSO': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            'COMPLETADA': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            'CANCELADA': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        };
        return badges[estado] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    const getTipoProfesionalIcon = (tipo) => {
        return tipo === 'PSICOLOGO' 
            ? <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            : <Utensils className="w-5 h-5 text-green-600 dark:text-green-400" />;
    };

    const getTipoSesionIcon = (tipo) => {
        return tipo === 'VIDEOLLAMADA'
            ? <Video className="w-4 h-4" />
            : <Calendar className="w-4 h-4" />;
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sesiones</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona las sesiones y citas</p>
                        </div>
                    </div>
                    <Link
                        to="/sesiones/nueva"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Sesión
                    </Link>
                </div>

                {/* Filtros Mejorados */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filtros de Búsqueda</h3>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Estado
                            </label>
                            <select
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                className="select-field"
                            >
                                <option value="todos">🔍 Todos los estados</option>
                                <option value="PROGRAMADA">📅 Programadas</option>
                                <option value="EN_CURSO">⏳ En curso</option>
                                <option value="COMPLETADA">✅ Completadas</option>
                                <option value="CANCELADA">❌ Canceladas</option>
                            </select>
                        </div>

                        {/* Tipo de sesión */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Video className="w-4 h-4 inline mr-1" />
                                Tipo de Sesión
                            </label>
                            <select
                                value={filters.tipo_sesion}
                                onChange={(e) => handleFilterChange('tipo_sesion', e.target.value)}
                                className="select-field"
                            >
                                <option value="todos">🔍 Todos los tipos</option>
                                <option value="PRESENCIAL">👥 Presencial</option>
                                <option value="VIDEOLLAMADA">📹 Videollamada</option>
                            </select>
                        </div>

                        {/* Fecha desde */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📅 Desde
                            </label>
                            <input
                                type="date"
                                value={filters.fecha_desde}
                                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {/* Fecha hasta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📅 Hasta
                            </label>
                            <input
                                type="date"
                                value={filters.fecha_hasta}
                                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>
                    
                    {/* Información de filtros activos */}
                    {(filters.estado !== 'todos' || filters.tipo_sesion !== 'todos' || filters.fecha_desde || filters.fecha_hasta) && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Info className="w-4 h-4" />
                                <span className="text-sm font-medium">Filtros activos aplicados</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista de Sesiones */}
                {loading ? (
                    <div className="card text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando sesiones...</p>
                    </div>
                ) : !sesiones || sesiones.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">No hay sesiones</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            {(filters.estado !== 'todos' || filters.tipo_sesion !== 'todos' || filters.fecha_desde || filters.fecha_hasta) 
                                ? 'No se encontraron sesiones con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                                : 'Aún no hay sesiones programadas en el sistema. ¡Programa la primera sesión!'
                            }
                        </p>
                        
                        {/* Sugerencias */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 max-w-lg mx-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Sugerencias</h4>
                            </div>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 text-left">
                                <li>• Verifica que tengas pacientes registrados</li>
                                <li>• Asegúrate de tener psicólogos activos</li>
                                <li>• Intenta cambiar los filtros de búsqueda</li>
                                <li>• Programa sesiones para diferentes fechas</li>
                            </ul>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/sesiones/nueva" className="btn-primary flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" />
                                Programar Nueva Sesión
                            </Link>
                            {(filters.estado !== 'todos' || filters.tipo_sesion !== 'todos' || filters.fecha_desde || filters.fecha_hasta) && (
                                <button
                                    onClick={() => setFilters({ estado: 'todos', tipo_sesion: 'todos', fecha_desde: '', fecha_hasta: '' })}
                                    className="btn-secondary flex items-center justify-center gap-2"
                                >
                                    <Search className="w-5 h-5" />
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sesiones.map((sesion) => {
                            const isUrgent = sesion.estado === 'EN_CURSO';
                            const isUpcoming = sesion.estado === 'PROGRAMADA' && new Date(sesion.fecha_hora) - new Date() < 24 * 60 * 60 * 1000;
                            
                            return (
                                <div key={sesion.id_sesion} className={`card hover:shadow-lg transition-all duration-200 ${
                                    isUrgent ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : 
                                    isUpcoming ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
                                }`}>
                                    {/* Alerta superior para sesiones urgentes */}
                                    {isUrgent && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Sesión en curso - Requiere atención</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Alerta para sesiones próximas */}
                                    {isUpcoming && !isUrgent && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                <Info className="w-4 h-4" />
                                                <span className="text-sm font-medium">Sesión próxima - Menos de 24 horas</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Información principal */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${
                                                    sesion.tipo_profesional === 'PSICOLOGO' 
                                                        ? 'bg-purple-100 dark:bg-purple-900/30' 
                                                        : 'bg-green-100 dark:bg-green-900/30'
                                                }`}>
                                                    {getTipoProfesionalIcon(sesion.tipo_profesional)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                                            {sesion.paciente?.nombre} {sesion.paciente?.apellido}
                                                        </h3>
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getEstadoBadge(sesion.estado)}`}>
                                                            {sesion.estado.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4 text-blue-500" />
                                                            <span className="font-medium">{formatFecha(sesion.fecha_hora)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Clock className="w-4 h-4 text-green-500" />
                                                            <span className="font-medium">{sesion.duracion_minutos} min</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            {getTipoSesionIcon(sesion.tipo_sesion)}
                                                            <span className="font-medium">{sesion.tipo_sesion}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            {getTipoProfesionalIcon(sesion.tipo_profesional)}
                                                            <span className="font-medium">{sesion.tipo_profesional}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {sesion.motivo && (
                                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                <span className="font-semibold text-gray-800 dark:text-gray-200">Motivo:</span> {sesion.motivo}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                to={`/sesiones/${sesion.id_sesion}`}
                                                className="btn-secondary flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver
                                            </Link>

                                            {sesion.estado === 'PROGRAMADA' && (
                                                <>
                                                    <button
                                                        onClick={() => handleIniciarSesion(sesion.id_sesion)}
                                                        className="btn-primary flex items-center gap-2"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                        Iniciar
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelarSesion(sesion.id_sesion)}
                                                        className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                                                        title="Cancelar sesión"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Cancelar</span>
                                                    </button>
                                                </>
                                            )}

                                            {sesion.estado === 'EN_CURSO' && (
                                                <>
                                                    {sesion.tipo_sesion === 'VIDEOLLAMADA' && (
                                                        <Link
                                                            to={`/videollamada/${sesion.id_sesion}`}
                                                            className="btn-primary flex items-center gap-2 animate-pulse"
                                                        >
                                                            <Video className="w-4 h-4" />
                                                            Unirse
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleCompletarSesion(sesion.id_sesion)}
                                                        className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2"
                                                        title="Completar sesión"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Completar</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Paginación Mejorada */}
                {pagination.last_page > 1 && (
                    <div className="card">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Mostrando página {pagination.current_page} de {pagination.last_page} ({pagination.total} sesiones en total)
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => fetchSesiones(page)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            page === pagination.current_page
                                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SesionesIndex;
