import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../config/api';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download, Printer } from 'lucide-react';

const MiMenuSemanal = () => {
    const [menuSemanal, setMenuSemanal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(null);
    const [comidasExpandidas, setComidasExpandidas] = useState(new Set());
    const toast = useToast();

    // Función para obtener el inicio de semana (lunes)
    const getInicioSemana = useCallback((fecha = new Date()) => {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    }, []);

    useEffect(() => {
        setFechaInicio(getInicioSemana());
    }, [getInicioSemana]);

    useEffect(() => {
        if (fechaInicio) {
            fetchMenuSemanal();
        }
    }, [fechaInicio]);

    const fetchMenuSemanal = useCallback(async () => {
        if (!fechaInicio) return;
        
        try {
            setLoading(true);
            const response = await api.get('/mi-menu-semanal', {
                params: { fecha_inicio: fechaInicio }
            });
            setMenuSemanal(response.data.data);
        } catch (error) {
            console.error('Error al cargar menú semanal:', error);
            toast.error('Error al cargar el menú semanal');
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, toast]);

    const cambiarSemana = useCallback((direccion) => {
        const nuevaFecha = new Date(fechaInicio);
        nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'anterior' ? -7 : 7));
        setFechaInicio(nuevaFecha.toISOString().split('T')[0]);
        setComidasExpandidas(new Set()); // Limpiar expansiones al cambiar semana
    }, [fechaInicio]);

    const toggleComida = useCallback((diaIndex, comidaIndex) => {
        const key = `${diaIndex}-${comidaIndex}`;
        setComidasExpandidas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    }, []);

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
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

    const handlePrint = () => {
        window.print();
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

    if (!menuSemanal || !menuSemanal.dias || menuSemanal.dias.length === 0) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                        No tienes menú programado
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Consulta con tu nutricionista para crear tu plan de alimentación
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 print:space-y-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 print:hidden">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Mi Menú Semanal
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {menuSemanal.plan?.nombre_plan}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* Navegación de Semanas */}
                <div className="card print:hidden">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => cambiarSemana('anterior')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Semana del {formatFecha(menuSemanal.fecha_inicio)} al {formatFecha(menuSemanal.fecha_fin)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {menuSemanal.totales_semana?.total_comidas} comidas programadas
                            </p>
                        </div>
                        <button
                            onClick={() => cambiarSemana('siguiente')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Resumen Semanal */}
                {menuSemanal.totales_semana && (
                    <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                            Totales de la Semana
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {menuSemanal.totales_semana.calorias}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">kcal totales</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {menuSemanal.totales_semana.proteinas}g
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Proteínas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {menuSemanal.totales_semana.carbohidratos}g
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Carbohidratos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {menuSemanal.totales_semana.grasas}g
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Grasas</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid de Días */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-2">
                    {menuSemanal.dias.map((dia, diaIndex) => (
                        <div key={diaIndex} className="card break-inside-avoid">
                            {/* Header del Día */}
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">
                                    {dia.dia_semana}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatFecha(dia.fecha)}
                                </p>
                                <div className="flex gap-2 mt-2 text-xs">
                                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                                        {dia.totales_dia.calorias} kcal
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                        {dia.comidas?.length} comidas
                                    </span>
                                </div>
                            </div>

                            {/* Comidas del Día */}
                            <div className="space-y-2">
                                {dia.comidas && dia.comidas.map((comida, comidaIndex) => {
                                    const key = `${diaIndex}-${comidaIndex}`;
                                    const expandido = comidasExpandidas.has(key);
                                    
                                    return (
                                        <div key={comidaIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden print:break-inside-avoid">
                                            {/* Header de Comida */}
                                            <button
                                                onClick={() => toggleComida(diaIndex, comidaIndex)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between print:bg-white print:cursor-default"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getTipoComidaIcon(comida.tipo_comida)}</span>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                            {comida.hora_recomendada}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {comida.totales.calorias} kcal
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="print:hidden">
                                                    {comidasExpandidas.has(key) ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Contenido de Comida (expandible) */}
                                            {(comidasExpandidas.has(key) || window.matchMedia('print').matches) && (
                                                <div className="p-3 bg-white dark:bg-gray-900 text-sm">
                                                    {comida.nombre && (
                                                        <p className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                                                            {comida.nombre}
                                                        </p>
                                                    )}
                                                    
                                                    {/* Alimentos */}
                                                    {comida.alimentos && comida.alimentos.length > 0 && (
                                                        <div className="space-y-1 mb-2">
                                                            {comida.alimentos.map((alimento, aIndex) => (
                                                                <div key={aIndex} className="flex justify-between text-xs">
                                                                    <span className="text-gray-700 dark:text-gray-300">
                                                                        • {alimento.nombre}
                                                                    </span>
                                                                    <span className="text-gray-500 dark:text-gray-400">
                                                                        {alimento.cantidad_gramos}g
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Macros */}
                                                    <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <span>P: {comida.totales.proteinas}g</span>
                                                        <span>C: {comida.totales.carbohidratos}g</span>
                                                        <span>G: {comida.totales.grasas}g</span>
                                                    </div>

                                                    {/* Instrucciones */}
                                                    {comida.instrucciones && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                                            {comida.instrucciones}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totales del Día */}
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Total:</span>
                                    <div className="flex gap-2">
                                        <span className="font-semibold">{dia.totales_dia.calorias} kcal</span>
                                        <span>P: {dia.totales_dia.proteinas}g</span>
                                        <span>C: {dia.totales_dia.carbohidratos}g</span>
                                        <span>G: {dia.totales_dia.grasas}g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Información de Plan */}
                {menuSemanal.plan && (
                    <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 print:mt-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Información del Plan
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Objetivo:</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {menuSemanal.plan.objetivo}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Calorías objetivo diarias:</p>
                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                    {menuSemanal.plan.calorias_objetivo} kcal
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MiMenuSemanal;
