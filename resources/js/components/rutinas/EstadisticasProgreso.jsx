import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Clock, Zap, Target, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EstadisticasProgreso = ({ rutinaId = null }) => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('semana');

    useEffect(() => {
        cargarEstadisticas();
    }, [periodo, rutinaId]);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const params = {
                periodo,
                rutina_id: rutinaId || undefined
            };

            Object.keys(params).forEach(key => {
                if (params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await axios.get('/api/sesiones-entrenamiento/estadisticas', { params });
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            toast.error('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const calcularTendencia = (actual, anterior) => {
        if (!anterior || anterior === 0) return 0;
        return ((actual - anterior) / anterior) * 100;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!estadisticas) {
        return null;
    }

    const tendenciaSesiones = calcularTendencia(
        estadisticas.sesiones_completadas,
        estadisticas.sesiones_periodo_anterior
    );

    const tendenciaCalorias = calcularTendencia(
        estadisticas.calorias_totales,
        estadisticas.calorias_periodo_anterior
    );

    return (
        <div className="space-y-6">
            {/* Selector de período */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Estadísticas y Progreso
                </h2>
                <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semana">Esta semana</SelectItem>
                        <SelectItem value="mes">Este mes</SelectItem>
                        <SelectItem value="año">Este año</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            {tendenciaSesiones !== 0 && (
                                <div className={`flex items-center gap-1 text-sm ${
                                    tendenciaSesiones > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {tendenciaSesiones > 0 ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(tendenciaSesiones).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sesiones Completadas</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {estadisticas.sesiones_completadas || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {Math.round((estadisticas.tiempo_total_minutos || 0) / 60)}h
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {estadisticas.tiempo_total_minutos || 0} minutos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            {tendenciaCalorias !== 0 && (
                                <div className={`flex items-center gap-1 text-sm ${
                                    tendenciaCalorias > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {tendenciaCalorias > 0 ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(tendenciaCalorias).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calorías Quemadas</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {estadisticas.calorias_totales || 0}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Racha Actual</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {estadisticas.racha_actual || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">días consecutivos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Frecuencia semanal */}
            <Card>
                <CardHeader>
                    <CardTitle>Frecuencia de Entrenamiento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Promedio semanal
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {estadisticas.frecuencia_semanal_promedio || 0}x
                            </span>
                        </div>
                        
                        {estadisticas.dias_mas_activos && estadisticas.dias_mas_activos.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Días más activos:</p>
                                <div className="flex flex-wrap gap-2">
                                    {estadisticas.dias_mas_activos.map((dia, index) => (
                                        <Badge key={index} variant="outline">
                                            {dia}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Logros y metas */}
            {estadisticas.logros && estadisticas.logros.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Logros Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {estadisticas.logros.map((logro, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                                >
                                    <div className="flex-shrink-0">
                                        <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {logro.titulo}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {logro.descripcion}
                                        </p>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                        {logro.fecha}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Gráfico simple de progreso */}
            {estadisticas.progreso_diario && estadisticas.progreso_diario.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Progreso Diario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {estadisticas.progreso_diario.map((dia, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                                        {dia.fecha}
                                    </span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${dia.porcentaje}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">
                                        {dia.sesiones}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EstadisticasProgreso;
