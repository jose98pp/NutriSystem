import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { ChevronDown, ChevronUp, MapPin, User, Package, Calendar, Printer } from 'lucide-react';

const EntregaView = () => {
    const { id } = useParams();
    const [entrega, setEntrega] = useState(null);
    const [loading, setLoading] = useState(true);
    const [diasExpandidos, setDiasExpandidos] = useState({});

    useEffect(() => {
        fetchEntrega();
    }, [id]);

    const fetchEntrega = async () => {
        try {
            const response = await api.get(`/entregas-programadas/${id}`);
            setEntrega(response.data.data);
        } catch (error) {
            console.error('Error al cargar entrega:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDia = (fecha) => {
        setDiasExpandidos(prev => ({
            ...prev,
            [fecha]: !prev[fecha]
        }));
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getEstadoColor = (estado) => {
        const colors = {
            'PROGRAMADA': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'PENDIENTE': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
            'ENTREGADA': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'OMITIDA': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
        };
        return colors[estado] || 'bg-gray-100 text-gray-700';
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

    if (!entrega) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Entrega no encontrada</p>
                    <Link to="/entregas" className="btn-primary mt-4">
                        Volver a Entregas
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <Link to="/entregas" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mb-2 inline-block">
                            ← Volver a Entregas
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Detalle de Entrega
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {formatFecha(entrega.fecha)}
                        </p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </button>
                </div>

                {/* Estado */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📦</span>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Estado actual</p>
                                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getEstadoColor(entrega.estado)}`}>
                                    {entrega.estado}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Paciente */}
                    <div className="card">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Paciente</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {entrega.calendario?.contrato?.paciente?.nombre} {entrega.calendario?.contrato?.paciente?.apellido}
                                </p>
                                {entrega.calendario?.contrato?.plan && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Plan: {entrega.calendario.contrato.plan.nombre_plan}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="card">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Dirección de Entrega</h3>
                                {entrega.direccion ? (
                                    <>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">{entrega.direccion.alias}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entrega.direccion.descripcion}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Sin dirección registrada</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de la Entrega */}
                {entrega.totales_semana && (
                    <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Resumen de la Entrega
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {entrega.totales_semana.total_comidas}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Comidas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {Math.round(entrega.totales_semana.calorias)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">kcal totales</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {Math.round(entrega.totales_semana.proteinas)}g
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Proteínas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {Math.round(entrega.totales_semana.carbohidratos)}g
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Carbos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {Math.round(entrega.totales_semana.grasas)}g
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Grasas</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido de la Entrega */}
                <div className="card">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Contenido de la Entrega ({entrega.comidas_semana?.length || 0} días)
                    </h3>

                    <div className="space-y-3">
                        {entrega.comidas_semana && entrega.comidas_semana.length > 0 ? (
                            entrega.comidas_semana.map((dia, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    {/* Header del Día */}
                                    <button
                                        onClick={() => toggleDia(dia.fecha)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {['🍳', '🥗', '🍽️', '🥤', '🌙'][index % 5]}
                                            </span>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {dia.dia_semana} - {formatFecha(dia.fecha)}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {dia.comidas?.length || 0} comidas - {Math.round(dia.totales_dia.calorias)} kcal
                                                </p>
                                            </div>
                                        </div>
                                        {diasExpandidos[dia.fecha] ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        )}
                                    </button>

                                    {/* Contenido del Día (expandible) */}
                                    {diasExpandidos[dia.fecha] && (
                                        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                                            {dia.comidas && dia.comidas.map((comida, cidx) => (
                                                <div key={cidx} className="border-l-4 border-primary-500 pl-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                                                {comida.hora_recomendada} - {comida.tipo_comida}
                                                            </p>
                                                            {comida.nombre && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{comida.nombre}</p>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                            {Math.round(comida.totales?.calorias || 0)} kcal
                                                        </span>
                                                    </div>

                                                    {/* Alimentos */}
                                                    {comida.alimentos && comida.alimentos.length > 0 && (
                                                        <div className="space-y-1 mb-2">
                                                            {comida.alimentos.map((alimento, aidx) => (
                                                                <div key={aidx} className="flex justify-between text-sm">
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

                                                    {/* Macros de la comida */}
                                                    {comida.totales && (
                                                        <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                                                            <span>P: {Math.round(comida.totales.proteinas)}g</span>
                                                            <span>C: {Math.round(comida.totales.carbohidratos)}g</span>
                                                            <span>G: {Math.round(comida.totales.grasas)}g</span>
                                                        </div>
                                                    )}

                                                    {comida.instrucciones && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                                            {comida.instrucciones}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Totales del día */}
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Total del día:</span>
                                                    <div className="flex gap-4 text-sm">
                                                        <span className="font-semibold">{Math.round(dia.totales_dia.calorias)} kcal</span>
                                                        <span className="text-blue-600 dark:text-blue-400">P: {Math.round(dia.totales_dia.proteinas)}g</span>
                                                        <span className="text-yellow-600 dark:text-yellow-400">C: {Math.round(dia.totales_dia.carbohidratos)}g</span>
                                                        <span className="text-orange-600 dark:text-orange-400">G: {Math.round(dia.totales_dia.grasas)}g</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No hay comidas programadas para esta entrega
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EntregaView;
