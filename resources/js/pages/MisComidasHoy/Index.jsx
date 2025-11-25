import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../config/api';
import { Check, Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const MisComidasHoy = () => {
    const [progreso, setProgreso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrando, setRegistrando] = useState(null);
    const toast = useToast();

    useEffect(() => {
        fetchProgreso();
    }, []);

    const fetchProgreso = async () => {
        try {
            const response = await api.get('/progreso-del-dia');
            setProgreso(response.data.data);
        } catch (error) {
            console.error('Error al cargar progreso:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarComida = async (id_comida, nombreComida) => {
        if (registrando === id_comida) return;
        
        setRegistrando(id_comida);
        try {
            const response = await api.post('/registrar-rapido', { id_comida });
            
            // Mostrar toast de éxito
            toast.success(`✅ ${nombreComida} registrada exitosamente`);
            
            // Recargar progreso para actualizar el estado
            await fetchProgreso();
            // No reseteamos registrando aquí, dejamos que el nuevo estado lo maneje
        } catch (error) {
            console.error('Error al registrar comida:', error);
            
            // Manejar diferentes tipos de errores
            if (error.response?.status === 400) {
                // Ya fue registrada
                toast.warning('⚠️ Ya registraste esta comida hoy');
            } else if (error.response?.data?.message) {
                // Error específico del backend
                toast.error(error.response.data.message);
            } else {
                // Error genérico
                toast.error('❌ Error al registrar la comida. Intenta nuevamente.');
            }
            
            setRegistrando(null);
        }
    };

    const getTipoComidaIcon = (tipo) => {
        const icons = {
            'DESAYUNO': '🍳',
            'COLACION_MATUTINA': '🥗',
            'ALMUERZO': '🍽️',
            'COLACION_VESPERTINA': '🥤',
            'CENA': '🌙'
        };
        return icons[tipo] || '🍴';
    };

    const getProgresoColor = (porcentaje) => {
        if (porcentaje >= 100) return 'bg-green-500';
        if (porcentaje >= 75) return 'bg-primary-500';
        if (porcentaje >= 50) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getProgresoTextColor = (porcentaje) => {
        if (porcentaje >= 100) return 'text-green-600 dark:text-green-400';
        if (porcentaje >= 75) return 'text-primary-600 dark:text-primary-400';
        if (porcentaje >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-orange-600 dark:text-orange-400';
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

    if (!progreso || !progreso.comidas_plan || progreso.comidas_plan.length === 0) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                        No tienes comidas programadas para hoy
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                        Consulta con tu nutricionista para crear tu plan de alimentación
                    </p>
                    <Link to="/mi-menu-semanal" className="btn-primary inline-block">
                        Ver Menú Semanal
                    </Link>
                </div>
            </Layout>
        );
    }

    const porcentajeProgreso = progreso.progreso?.calorias || 0;
    const comidasCompletadas = progreso.comidas_completadas || 0;
    const totalComidas = progreso.total_comidas || 0;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Mis Comidas de Hoy
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(progreso.fecha).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            📋 Comidas de tu plan • <Link to="/ingestas" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">Ver historial completo</Link>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/ingestas/nuevo" className="btn-secondary flex items-center gap-2">
                            + Alimentos Libres
                        </Link>
                        <Link to="/mi-menu-semanal" className="btn-secondary flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Menú Semanal
                        </Link>
                    </div>
                </div>

                {/* Barra de Progreso Principal */}
                <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Progreso del Día
                        </h3>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Comidas completadas: {comidasCompletadas} / {totalComidas}
                            </span>
                            <span className={`text-2xl font-bold ${getProgresoTextColor(porcentajeProgreso)}`}>
                                {Math.round(porcentajeProgreso)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${getProgresoColor(porcentajeProgreso)} transition-all duration-500`}
                                style={{ width: `${Math.min(porcentajeProgreso, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Calorías</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {progreso.totales_consumidos.calorias} / {progreso.totales_plan.calorias}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Proteínas</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {progreso.totales_consumidos.proteinas}g / {progreso.totales_plan.proteinas}g
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Carbohidratos</p>
                            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                {progreso.totales_consumidos.carbohidratos}g / {progreso.totales_plan.carbohidratos}g
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">Grasas</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {progreso.totales_consumidos.grasas}g / {progreso.totales_plan.grasas}g
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de Comidas */}
                <div className="space-y-4">
                    {progreso.comidas_plan.map((comida, index) => {
                        const isCompletada = comida.consumida;
                        const isRegistrando = registrando === comida.id_comida;

                        return (
                            <div 
                                key={index} 
                                className={`card ${isCompletada ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Hora e Icono */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center ${
                                            isCompletada 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {isCompletada ? (
                                                <Check className="w-10 h-10" />
                                            ) : (
                                                <>
                                                    <span className="text-2xl">{getTipoComidaIcon(comida.tipo_comida)}</span>
                                                    <span className="text-xs mt-1">{comida.hora_recomendada}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Información de la Comida */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                                    {comida.tipo_comida.replace(/_/g, ' ')}
                                                </h3>
                                                {comida.nombre && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{comida.nombre}</p>
                                                )}
                                            </div>
                                            {isCompletada && (
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
                                                    ✓ Completada
                                                </span>
                                            )}
                                        </div>

                                        {/* Alimentos */}
                                        {comida.alimentos && comida.alimentos.length > 0 && (
                                            <div className="space-y-1 mb-3">
                                                {comida.alimentos.map((alimento, aIndex) => (
                                                    <div key={aIndex} className="flex justify-between text-sm">
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            • {alimento.nombre}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {alimento.pivot?.cantidad_gramos}g
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Totales Nutricionales */}
                                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                                                {comida.totales.calorias} kcal
                                            </span>
                                            <span>P: {comida.totales.proteinas}g</span>
                                            <span>C: {comida.totales.carbohidratos}g</span>
                                            <span>G: {comida.totales.grasas}g</span>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="flex gap-2">
                                            {!isCompletada ? (
                                                <>
                                                    <button
                                                        onClick={() => handleRegistrarComida(comida.id_comida, comida.tipo_comida.replace(/_/g, ' '))}
                                                        disabled={isRegistrando}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                                            isRegistrando 
                                                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white' 
                                                                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                                                        }`}
                                                    >
                                                        {isRegistrando ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                                Registrando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Ya comí esto
                                                            </>
                                                        )}
                                                    </button>
                                                    <Link
                                                        to="/ingestas/nueva?tipo=libre"
                                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                                                    >
                                                        ➕ Agregar alimentos extra
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
                                                    <Check className="w-5 h-5" />
                                                    Comida registrada
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Proyección */}
                {comidasCompletadas < totalComidas && (
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                    Proyección del Día
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Si completas todas tus comidas hoy, alcanzarás <strong>{progreso.totales_plan.calorias} kcal</strong> de tu objetivo.
                                    {progreso.plan.calorias_objetivo && (
                                        <span>
                                            {' '}Tu objetivo es <strong>{progreso.plan.calorias_objetivo} kcal</strong> al día.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MisComidasHoy;
