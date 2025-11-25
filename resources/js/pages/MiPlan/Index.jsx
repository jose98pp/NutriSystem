import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../config/api';
import { Calendar, Target, TrendingUp, Clock, ChevronRight, FileText } from 'lucide-react';

const MiPlan = () => {
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchMiPlan();
    }, []);

    const fetchMiPlan = async () => {
        try {
            setLoading(true);
            const response = await api.get('/mi-plan');
            setPlanData(response.data.data);
        } catch (error) {
            console.error('Error al cargar plan:', error);
            toast.error('Error al cargar tu plan de alimentación');
        } finally {
            setLoading(false);
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </Layout>
        );
    }

    if (!planData || !planData.plan_activo) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        No tienes un plan activo
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Consulta con tu nutricionista para crear tu plan de alimentación personalizado
                    </p>
                    
                    {planData?.todos_los_planes && planData.todos_los_planes.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                Planes Anteriores
                            </h4>
                            <div className="grid gap-4 max-w-2xl mx-auto">
                                {planData.todos_los_planes.map((plan) => (
                                    <div key={plan.id_plan} className="card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {plan.nombre}
                                                </h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {formatFecha(plan.fecha_inicio)} - {formatFecha(plan.fecha_fin)}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                                                Finalizado
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }

    const plan = planData.plan_activo;
    const diasRestantes = getDiasRestantes(plan.fecha_fin);

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Mi Plan de Alimentación
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Plan personalizado diseñado por tu nutricionista
                    </p>
                </div>

                {/* Plan Activo */}
                <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {plan.nombre}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {plan.descripcion}
                            </p>
                        </div>
                        <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                            Plan Activo
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Inicio</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                    {formatFecha(plan.fecha_inicio)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Días restantes</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                    {diasRestantes} días
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Finaliza</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                    {formatFecha(plan.fecha_fin)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/mi-menu-semanal"
                        className="card hover:shadow-lg transition-shadow group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        Mi Menú Semanal
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Ver comidas programadas
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                        </div>
                    </Link>

                    <Link
                        to="/mis-comidas-hoy"
                        className="card hover:shadow-lg transition-shadow group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                        Mis Comidas de Hoy
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Registrar progreso diario
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                        </div>
                    </Link>
                </div>

                {/* Información del Servicio */}
                {plan.contrato && plan.contrato.servicio && (
                    <div className="card">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Información del Servicio
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Servicio</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {plan.contrato.servicio.nombre}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Descripción</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {plan.contrato.servicio.descripcion || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Planes Anteriores */}
                {planData.todos_los_planes && planData.todos_los_planes.length > 1 && (
                    <div className="card">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            Historial de Planes ({planData.todos_los_planes.length - 1})
                        </h4>
                        <div className="space-y-3">
                            {planData.todos_los_planes
                                .filter(p => p.id_plan !== plan.id_plan)
                                .slice(0, 3)
                                .map((planAnterior) => (
                                    <div key={planAnterior.id_plan} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                                {planAnterior.nombre}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatFecha(planAnterior.fecha_inicio)} - {formatFecha(planAnterior.fecha_fin)}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                            Finalizado
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MiPlan;
