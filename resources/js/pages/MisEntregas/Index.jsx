import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { 
    Package, Calendar, MapPin, CheckCircle, Clock, 
    XCircle, AlertCircle, Info, Utensils
} from 'lucide-react';

const MisEntregasIndex = () => {
    const [entregas, setEntregas] = useState([]);
    const [proximasEntregas, setProximasEntregas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('proximas'); // 'proximas' o 'todas'

    useEffect(() => {
        fetchProximasEntregas();
        fetchTodasEntregas();
    }, []);

    const fetchProximasEntregas = async () => {
        try {
            const response = await api.get('/mis-entregas/proximas');
            setProximasEntregas(response.data.data);
        } catch (error) {
            console.error('Error al cargar próximas entregas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodasEntregas = async () => {
        try {
            const response = await api.get('/mis-entregas');
            setEntregas(response.data.data);
        } catch (error) {
            console.error('Error al cargar todas las entregas:', error);
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

    const getDiasHasta = (fecha) => {
        const hoy = new Date();
        const fechaEntrega = new Date(fecha);
        const diff = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Mañana';
        if (diff > 1) return `En ${diff} días`;
        if (diff === -1) return 'Ayer';
        return `Hace ${Math.abs(diff)} días`;
    };

    const getEstadoColor = (estado) => {
        const colors = {
            'PROGRAMADA': 'bg-blue-100 text-blue-700 border-blue-200',
            'PENDIENTE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'ENTREGADA': 'bg-green-100 text-green-700 border-green-200',
            'OMITIDA': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            'PROGRAMADA': <Calendar size={16} />,
            'PENDIENTE': <Clock size={16} />,
            'ENTREGADA': <CheckCircle size={16} />,
            'OMITIDA': <XCircle size={16} />,
        };
        return icons[estado] || <Package size={16} />;
    };

    const entregasAMostrar = view === 'proximas' ? proximasEntregas : entregas;
    const esHoy = (fecha) => {
        const hoy = new Date().toDateString();
        const fechaEntrega = new Date(fecha).toDateString();
        return hoy === fechaEntrega;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mis Entregas</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Programación de tus entregas de catering</p>
                    </div>
                    <Link to="/mi-calendario" className="btn-secondary flex items-center gap-2">
                        <Calendar size={20} />
                        Ver Calendario
                    </Link>
                </div>

                {/* Selector de Vista */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setView('proximas')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                            view === 'proximas' 
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Clock size={18} />
                        Próximas
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            view === 'proximas'
                                ? 'bg-white/20'
                                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        }`}>
                            {proximasEntregas.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setView('todas')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                            view === 'todas' 
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Package size={18} />
                        Todas
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            view === 'todas'
                                ? 'bg-white/20'
                                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        }`}>
                            {entregas.length}
                        </span>
                    </button>
                </div>

                <div className="card">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : entregasAMostrar.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                {view === 'proximas' ? 'No tienes entregas próximas' : 'No tienes entregas registradas'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                Consulta con tu nutricionista para configurar tu calendario de entregas
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {entregasAMostrar.map((entrega) => (
                                <div 
                                    key={entrega.id_entrega} 
                                    className={`border-2 rounded-lg p-5 transition-all ${
                                        esHoy(entrega.fecha) 
                                            ? 'border-primary-500 bg-primary-50 shadow-lg' 
                                            : 'border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Fecha e Icono */}
                                        <div className="flex-shrink-0 text-center">
                                            <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center ${
                                                esHoy(entrega.fecha) 
                                                    ? 'bg-primary-500 text-white' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                <div className="text-3xl font-bold">
                                                    {new Date(entrega.fecha).getDate()}
                                                </div>
                                                <div className="text-xs uppercase">
                                                    {new Date(entrega.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                                                </div>
                                            </div>
                                            {esHoy(entrega.fecha) && (
                                                <div className="mt-2">
                                                    <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                                        HOY
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Información */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {formatDate(entrega.fecha)}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {getDiasHasta(entrega.fecha)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(entrega.estado)}`}>
                                                        {getEstadoIcon(entrega.estado)} {entrega.estado}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {entrega.direccion && (
                                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">Dirección de Entrega</p>
                                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{entrega.direccion.alias}</p>
                                                            <p className="text-xs text-blue-700 dark:text-blue-300 truncate">{entrega.direccion.descripcion}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {entrega.comida && (
                                                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Utensils className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">Tipo de Comida</p>
                                                            <p className="text-sm font-bold text-purple-900 dark:text-purple-100">{entrega.comida.tipo_comida}</p>
                                                            <p className="text-xs text-purple-700 dark:text-purple-300">ID: #{entrega.comida.id_comida}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {view === 'proximas' && proximasEntregas.length > 0 && (
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-l-4 border-primary-500 p-5 rounded-xl animate-fadeIn">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
                                <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-primary-900 dark:text-primary-100 font-medium mb-1">
                                    Recordatorio Importante
                                </p>
                                <p className="text-sm text-primary-800 dark:text-primary-200">
                                    Estas son tus próximas 7 entregas programadas. Asegúrate de estar disponible en la dirección indicada.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MisEntregasIndex;
