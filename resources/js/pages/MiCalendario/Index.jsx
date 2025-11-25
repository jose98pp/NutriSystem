import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { 
    Calendar, Package, CheckCircle, Clock, ShoppingCart, 
    MapPin, ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';

const MiCalendarioIndex = () => {
    const [calendario, setCalendario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        fetchCalendario();
    }, []);

    const fetchCalendario = async () => {
        try {
            const response = await api.get('/mi-calendario');
            setCalendario(response.data.data);
            if (response.data.message) {
                setMensaje(response.data.message);
            }
        } catch (error) {
            console.error('Error al cargar calendario:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDiasRestantes = () => {
        if (!calendario) return 0;
        const hoy = new Date();
        const fin = new Date(calendario.fecha_fin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const getEstadoEntregas = () => {
        if (!calendario || !calendario.entregas) return { total: 0, entregadas: 0, pendientes: 0 };
        
        const total = calendario.entregas.length;
        const entregadas = calendario.entregas.filter(e => e.estado === 'ENTREGADA').length;
        const pendientes = calendario.entregas.filter(e => e.estado === 'PROGRAMADA' || e.estado === 'PENDIENTE').length;
        
        return { total, entregadas, pendientes };
    };

    const proximasEntregas = calendario?.entregas
        ?.filter(e => new Date(e.fecha) >= new Date() && (e.estado === 'PROGRAMADA' || e.estado === 'PENDIENTE'))
        ?.slice(0, 5) || [];

    const stats = getEstadoEntregas();

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mi Calendario de Entregas</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Programación de tus entregas de catering</p>
                    </div>
                    <Link to="/mis-entregas" className="btn-primary flex items-center gap-2">
                        <Package size={20} />
                        Ver Todas las Entregas
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : !calendario ? (
                    <div className="card-hover text-center py-16 animate-fadeIn">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {mensaje || 'No tienes un calendario activo'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Solicita a tu nutricionista que configure tu calendario de entregas para comenzar a recibir tus comidas
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Resumen del Calendario */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="card-hover bg-gradient-to-br from-blue-500 to-blue-600 text-white animate-fadeIn">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                                        <Calendar className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Días Restantes</p>
                                        <p className="text-3xl font-bold">{getDiasRestantes()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-hover bg-gradient-to-br from-green-500 to-green-600 text-white animate-fadeIn">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Entregadas</p>
                                        <p className="text-3xl font-bold">{stats.entregadas}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-hover bg-gradient-to-br from-yellow-500 to-yellow-600 text-white animate-fadeIn">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                                        <Clock className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Pendientes</p>
                                        <p className="text-3xl font-bold">{stats.pendientes}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-hover bg-gradient-to-br from-purple-500 to-purple-600 text-white animate-fadeIn">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                                        <ShoppingCart className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90 font-medium">Total Entregas</p>
                                        <p className="text-3xl font-bold">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información del Calendario */}
                        <div className="card-hover animate-fadeIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Información del Calendario</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Fecha de Inicio</p>
                                        <p className="font-bold text-blue-900 dark:text-blue-100">{formatDate(calendario.fecha_inicio)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Fecha de Fin</p>
                                        <p className="font-bold text-purple-900 dark:text-purple-100">{formatDate(calendario.fecha_fin)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Próximas Entregas */}
                        <div className="card-hover animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Próximas 5 Entregas</h3>
                                </div>
                                <Link to="/mis-entregas" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all">
                                    Ver todas
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                            
                            {proximasEntregas.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No hay entregas próximas programadas</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {proximasEntregas.map((entrega) => (
                                        <div key={entrega.id_entrega} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                                            <div className="flex-shrink-0 w-16 text-center bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                    {new Date(entrega.fecha).getDate()}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-gray-100 capitalize">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', { weekday: 'long' })}
                                                </p>
                                                {entrega.direccion && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        <MapPin size={14} />
                                                        <span className="truncate">{entrega.direccion.alias}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-300 dark:border-blue-700">
                                                    {entrega.estado}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default MiCalendarioIndex;
