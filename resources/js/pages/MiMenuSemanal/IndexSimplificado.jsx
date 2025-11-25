import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../config/api';
import { Calendar, Apple, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const MiMenuSemanalSimplificado = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchMiPlan();
    }, []);

    const fetchMiPlan = async () => {
        try {
            setLoading(true);
            const response = await api.get('/mi-plan');
            
            if (response.data.success && response.data.data.plan_activo) {
                setPlan(response.data.data.plan_activo);
            } else {
                setPlan(null);
            }
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

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </Layout>
        );
    }

    if (!plan) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        No tienes un plan activo
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Consulta con tu nutricionista para crear tu plan de alimentación
                    </p>
                    <Link to="/mi-plan" className="btn-primary inline-block">
                        Ver Mi Plan
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Mi Menú Semanal
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Plan de alimentación personalizado
                    </p>
                </div>

                {/* Información del Plan */}
                <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {plan.nombre || 'Plan de Alimentación'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {plan.descripcion || 'Plan personalizado por tu nutricionista'}
                            </p>
                        </div>
                        <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                            Plan Activo
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Período</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                    {formatFecha(plan.fecha_inicio)} - {formatFecha(plan.fecha_fin)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Días del plan</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                    {plan.dias?.length || 0} días programados
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Días del Plan */}
                {plan.dias && plan.dias.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {plan.dias.map((dia, index) => (
                            <div key={index} className="card">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                        Día {dia.dia_index || index + 1}
                                    </h3>
                                    {dia.fecha && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatFecha(dia.fecha)}
                                        </p>
                                    )}
                                </div>

                                {/* Comidas del Día */}
                                {dia.comidas && dia.comidas.length > 0 ? (
                                    <div className="space-y-2">
                                        {dia.comidas.map((comida, cIndex) => (
                                            <div key={cIndex} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                                                        {comida.tipo_comida?.replace('_', ' ') || 'Comida'}
                                                    </span>
                                                </div>
                                                
                                                {comida.alimentos && comida.alimentos.length > 0 && (
                                                    <div className="space-y-1">
                                                        {comida.alimentos.map((alimento, aIndex) => (
                                                            <div key={aIndex} className="flex justify-between text-sm">
                                                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                                    <Apple className="w-3 h-3" />
                                                                    {alimento.nombre}
                                                                </span>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    {alimento.pivot?.cantidad_gramos || alimento.cantidad_gramos}g
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        Sin comidas programadas
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <AlertCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Plan sin días programados
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Tu nutricionista aún no ha programado los días de tu plan
                        </p>
                        <Link to="/mi-plan" className="btn-secondary inline-block">
                            Ver Detalles del Plan
                        </Link>
                    </div>
                )}

                {/* Información del Contrato */}
                {plan.contrato && (
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                            Información del Servicio
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {plan.contrato.servicio && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="flex gap-4">
                    <Link to="/mi-plan" className="btn-secondary flex-1">
                        Ver Mi Plan Completo
                    </Link>
                    <Link to="/mis-comidas-hoy" className="btn-primary flex-1">
                        Registrar Comidas de Hoy
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default MiMenuSemanalSimplificado;
