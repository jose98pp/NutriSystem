import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { logApiError } from '../../utils/logger';
import { ArrowLeft, Edit, Calendar, DollarSign, User, FileText, Clock, Ban } from 'lucide-react';

const ContratoView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [contrato, setContrato] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContrato();
    }, [id]);

    const fetchContrato = async () => {
        try {
            const response = await api.get(`/contratos/${id}`);
            setContrato(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            logApiError(`/contratos/${id}`, error);
            toast.error('Error al cargar el contrato');
            navigate('/contratos');
        }
    };

    const getEstadoBadgeClass = (estado) => {
        const classes = {
            'PENDIENTE': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'ACTIVO': 'bg-green-100 text-green-800 border-green-300',
            'FINALIZADO': 'bg-gray-100 text-gray-800 border-gray-300',
            'CANCELADO': 'bg-red-100 text-red-800 border-red-300'
        };
        return classes[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const calculateDaysRemaining = () => {
        if (!contrato?.fecha_fin) return null;
        const today = new Date();
        const endDate = new Date(contrato.fecha_fin);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateProgress = () => {
        if (!contrato?.fecha_inicio || !contrato?.fecha_fin) return 0;
        const today = new Date();
        const startDate = new Date(contrato.fecha_inicio);
        const endDate = new Date(contrato.fecha_fin);
        
        const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
        
        const progress = (elapsedDays / totalDays) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Cargando contrato...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!contrato) {
        return null;
    }

    const daysRemaining = calculateDaysRemaining();
    const progress = calculateProgress();

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/contratos')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver a Contratos
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                Detalles del Contrato
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Contrato #{contrato.id_contrato}
                            </p>
                        </div>
                        {(user?.role === 'admin' || user?.role === 'nutricionista') && contrato.estado !== 'CANCELADO' && (
                            <Link
                                to={`/contratos/${id}/editar`}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Edit size={20} />
                                Editar
                            </Link>
                        )}
                    </div>
                </div>

                {/* Estado Badge */}
                <div className="mb-6">
                    <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border-2 ${getEstadoBadgeClass(contrato.estado)}`}>
                        {contrato.estado}
                    </span>
                </div>

                {/* Progress Bar (solo para contratos activos) */}
                {contrato.estado === 'ACTIVO' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Progreso del Contrato</h3>
                            {daysRemaining !== null && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Contrato vencido'}
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                                className="bg-blue-600 dark:bg-blue-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.toFixed(1)}% completado</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del Paciente */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                <User className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Información del Paciente</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Nombre Completo</label>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">
                                    {contrato.paciente?.nombre} {contrato.paciente?.apellido}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                                <p className="text-gray-900 dark:text-gray-100">{contrato.paciente?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Teléfono</label>
                                <p className="text-gray-900 dark:text-gray-100">{contrato.paciente?.telefono || '-'}</p>
                            </div>
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    to={`/pacientes/${contrato.id_paciente}/editar`}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    Ver perfil completo →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Información del Servicio */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                                <FileText className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Servicio Contratado</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Nombre del Servicio</label>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{contrato.servicio?.nombre}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Tipo</label>
                                <p className="text-gray-900 dark:text-gray-100 capitalize">{contrato.servicio?.tipo_servicio?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Duración</label>
                                <p className="text-gray-900 dark:text-gray-100">{contrato.servicio?.duracion_dias} días</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Descripción</label>
                                <p className="text-gray-900 dark:text-gray-100 text-sm">{contrato.servicio?.descripcion || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                                <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Fechas</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Fecha de Inicio</label>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(contrato.fecha_inicio)}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Fecha de Fin</label>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(contrato.fecha_fin)}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Fecha de Creación</label>
                                <p className="text-gray-900 dark:text-gray-100">{formatDate(contrato.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información Financiera */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                                <DollarSign className="text-yellow-600 dark:text-yellow-400" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Información Financiera</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Costo Contratado</label>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    ${parseFloat(contrato.costo_contratado).toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Costo Base del Servicio</label>
                                <p className="text-gray-900 dark:text-gray-100">
                                    ${parseFloat(contrato.servicio?.costo || 0).toFixed(2)}
                                </p>
                            </div>
                            {contrato.costo_contratado !== contrato.servicio?.costo && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Diferencia: 
                                        <span className={`ml-2 font-medium ${
                                            contrato.costo_contratado > contrato.servicio?.costo 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            ${Math.abs(contrato.costo_contratado - contrato.servicio?.costo).toFixed(2)}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Observaciones */}
                {contrato.observaciones && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Observaciones</h2>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{contrato.observaciones}</p>
                    </div>
                )}

                {/* Plan Vinculado */}
                {contrato.planes_alimentacion && contrato.planes_alimentacion.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Planes Alimentarios Vinculados</h2>
                        <div className="space-y-2">
                            {contrato.planes_alimentacion.map(plan => (
                                <Link
                                    key={plan.id_plan}
                                    to={`/planes/${plan.id_plan}`}
                                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{plan.nombre}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{plan.descripcion}</p>
                                        </div>
                                        <span className="text-blue-600 dark:text-blue-400">Ver plan →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ContratoView;
