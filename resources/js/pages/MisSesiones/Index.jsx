import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { Calendar, Video, Users, Clock, Brain, Utensils, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../config/api';

const MisSesionesIndex = () => {
    const [sesiones, setSesiones] = useState([]);
    const [proximasSesiones, setProximasSesiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [pagination, setPagination] = useState({});
    const toast = useToast();

    const fetchSesiones = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                estado: filtroEstado !== 'todas' ? filtroEstado : undefined
            };
            
            const response = await api.get('/mis-sesiones', { params });
            setSesiones(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error al cargar sesiones:', error);
            toast.error('❌ Error al cargar tus sesiones');
        } finally {
            setLoading(false);
        }
    };

    const fetchProximasSesiones = async () => {
        try {
            const response = await api.get('/proximas-sesiones');
            setProximasSesiones(response.data.data);
        } catch (error) {
            console.error('Error al cargar próximas sesiones:', error);
        }
    };

    useEffect(() => {
        fetchSesiones();
        fetchProximasSesiones();
    }, [filtroEstado]);

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
            : <Users className="w-4 h-4" />;
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

    const formatFechaRelativa = (fecha) => {
        const ahora = new Date();
        const fechaSesion = new Date(fecha);
        const diffMs = fechaSesion - ahora;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDias = Math.floor(diffHoras / 24);

        if (diffDias > 0) {
            return `En ${diffDias} día${diffDias > 1 ? 's' : ''}`;
        } else if (diffHoras > 0) {
            return `En ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
        } else if (diffMs > 0) {
            const diffMinutos = Math.floor(diffMs / (1000 * 60));
            return `En ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
        } else {
            return 'Ahora';
        }
    };

    const puedeUnirse = (sesion) => {
        const ahora = new Date();
        const fechaSesion = new Date(sesion.fecha_hora);
        const diffMs = fechaSesion - ahora;
        const diffMinutos = diffMs / (1000 * 60);
        
        // Puede unirse 15 minutos antes hasta 30 minutos después
        return diffMinutos >= -30 && diffMinutos <= 15 && sesion.estado !== 'CANCELADA';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mis Sesiones</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Consulta tus citas programadas</p>
                    </div>
                </div>

                {/* Próximas Sesiones */}
                {proximasSesiones.length > 0 && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            Próximas Sesiones
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {proximasSesiones.map((sesion) => (
                                <div key={sesion.id_sesion} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        {getTipoProfesionalIcon(sesion.tipo_profesional)}
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                {sesion.tipo_profesional === 'PSICOLOGO' ? 'Psicólogo' : 'Nutricionista'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatFechaRelativa(sesion.fecha_hora)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            {getTipoSesionIcon(sesion.tipo_sesion)}
                                            {sesion.tipo_sesion}
                                        </div>
                                        {sesion.tipo_sesion === 'VIDEOLLAMADA' && puedeUnirse(sesion) && (
                                            <Link
                                                to={`/videollamada/${sesion.id_sesion}`}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                            >
                                                <Video className="w-3 h-3" />
                                                Unirse
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="card">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFiltroEstado('todas')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                filtroEstado === 'todas'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFiltroEstado('PROGRAMADA')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                filtroEstado === 'PROGRAMADA'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Programadas
                        </button>
                        <button
                            onClick={() => setFiltroEstado('COMPLETADA')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                filtroEstado === 'COMPLETADA'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Completadas
                        </button>
                    </div>
                </div>

                {/* Lista de Sesiones */}
                {loading ? (
                    <div className="card text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tus sesiones...</p>
                    </div>
                ) : sesiones.length === 0 ? (
                    <div className="card text-center py-16">
                        <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No hay sesiones</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filtroEstado !== 'todas' 
                                ? 'No tienes sesiones con este estado'
                                : 'Aún no tienes sesiones programadas'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sesiones.map((sesion) => (
                            <div key={sesion.id_sesion} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Información principal */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                {getTipoProfesionalIcon(sesion.tipo_profesional)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                                        Sesión con {sesion.tipo_profesional === 'PSICOLOGO' ? 'Psicólogo' : 'Nutricionista'}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(sesion.estado)}`}>
                                                        {sesion.estado.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatFecha(sesion.fecha_hora)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {sesion.duracion_minutos} min
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {getTipoSesionIcon(sesion.tipo_sesion)}
                                                        {sesion.tipo_sesion}
                                                    </div>
                                                </div>
                                                {sesion.motivo && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                        <strong>Motivo:</strong> {sesion.motivo}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        {sesion.tipo_sesion === 'VIDEOLLAMADA' && puedeUnirse(sesion) && (
                                            <Link
                                                to={`/videollamada/${sesion.id_sesion}`}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <Video className="w-4 h-4" />
                                                Unirse a Videollamada
                                            </Link>
                                        )}
                                        {sesion.estado === 'COMPLETADA' && (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="text-sm font-medium">Completada</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {pagination.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => fetchSesiones(page)}
                                className={`px-3 py-2 rounded-lg ${
                                    page === pagination.current_page
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MisSesionesIndex;
