import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Filter, Download, TrendingUp, Clock, Zap } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

const HistorialSesiones = () => {
    const [sesiones, setSesiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        fecha_inicio: null,
        fecha_fin: null,
        rutina_id: ''
    });
    const [rutinas, setRutinas] = useState([]);
    const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [filtros]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const params = {
                fecha_inicio: filtros.fecha_inicio?.toISOString().split('T')[0],
                fecha_fin: filtros.fecha_fin?.toISOString().split('T')[0],
                rutina_id: filtros.rutina_id || undefined
            };

            Object.keys(params).forEach(key => {
                if (params[key] === undefined) {
                    delete params[key];
                }
            });

            const [sesionesResponse, rutinasResponse, estadisticasResponse] = await Promise.all([
                api.get('/sesiones-entrenamiento', { params }),
                api.get('/rutinas/mis-rutinas'),
                api.get('/sesiones-entrenamiento/estadisticas', { params })
            ]);

            const sesionesList = sesionesResponse?.data?.data ?? sesionesResponse?.data;
            setSesiones(Array.isArray(sesionesList) ? sesionesList : Array.isArray(sesionesResponse?.data?.data) ? sesionesResponse.data.data : []);
            const rutinasList = rutinasResponse?.data?.data ?? rutinasResponse?.data;
            setRutinas(Array.isArray(rutinasList) ? rutinasList : []);
            setEstadisticas(estadisticasResponse.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    const exportarReporte = async () => {
        try {
            toast.success('Generando reporte PDF...');
            // Aquí iría la lógica de exportación
            // Por ahora solo mostramos un mensaje
            setTimeout(() => {
                toast.success('Reporte generado correctamente');
            }, 1500);
        } catch (error) {
            console.error('Error al exportar reporte:', error);
            toast.error('Error al generar el reporte');
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatearHora = (fecha) => {
        return new Date(fecha).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const sesionesAgrupadas = sesiones.reduce((acc, sesion) => {
        const fecha = new Date(sesion.fecha_inicio).toLocaleDateString('es-ES');
        if (!acc[fecha]) {
            acc[fecha] = [];
        }
        acc[fecha].push(sesion);
        return acc;
    }, {});

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Historial de Entrenamientos
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Revisa tu progreso y sesiones completadas
                    </p>
                </div>
                <Button
                    onClick={exportarReporte}
                    className="flex items-center gap-2"
                    variant="outline"
                >
                    <Download className="w-4 h-4" />
                    Exportar Reporte
                </Button>
            </div>

            {/* Estadísticas generales */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sesiones</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {estadisticas.sesiones_completadas || 0}
                                    </p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {Math.round((estadisticas.tiempo_total_minutos || 0) / 60)}h
                                    </p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Calorías</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {estadisticas.calorias_totales || 0}
                                    </p>
                                </div>
                                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                    <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Racha Actual</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {estadisticas.racha_actual || 0}
                                    </p>
                                    <p className="text-xs text-gray-500">días</p>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Fecha Inicio
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filtros.fecha_inicio ? (
                                            filtros.fecha_inicio.toLocaleDateString('es-ES')
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filtros.fecha_inicio}
                                        onSelect={(date) => setFiltros({ ...filtros, fecha_inicio: date })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Fecha Fin
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filtros.fecha_fin ? (
                                            filtros.fecha_fin.toLocaleDateString('es-ES')
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={filtros.fecha_fin}
                                        onSelect={(date) => setFiltros({ ...filtros, fecha_fin: date })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Rutina
                            </label>
                            <Select
                                value={filtros.rutina_id}
                                onValueChange={(value) => setFiltros({ ...filtros, rutina_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las rutinas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todas las rutinas</SelectItem>
                                    {rutinas.map((rutina) => (
                                        <SelectItem key={rutina.id} value={rutina.id.toString()}>
                                            {rutina.rutina?.nombre || rutina.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {(filtros.fecha_inicio || filtros.fecha_fin || filtros.rutina_id) && (
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFiltros({ fecha_inicio: null, fecha_fin: null, rutina_id: '' })}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de sesiones */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            ) : Object.keys(sesionesAgrupadas).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(sesionesAgrupadas).map(([fecha, sesionesDia]) => (
                        <div key={fecha}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                                {fecha}
                            </h3>
                            <div className="space-y-3">
                                {sesionesDia.map((sesion) => (
                                    <Card
                                        key={sesion.id}
                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSesionSeleccionada(sesion.id === sesionSeleccionada ? null : sesion.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-lg">
                                                            {sesion.rutina_paciente?.rutina?.nombre || 'Rutina'}
                                                        </h4>
                                                        <Badge
                                                            className={
                                                                sesion.completada
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                            }
                                                        >
                                                            {sesion.completada ? 'Completada' : 'Incompleta'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Hora</p>
                                                            <p className="font-medium">{formatearHora(sesion.fecha_inicio)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Duración</p>
                                                            <p className="font-medium">{sesion.duracion_minutos || 0} min</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Calorías</p>
                                                            <p className="font-medium">{sesion.calorias_quemadas || 0} cal</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Progreso</p>
                                                            <p className="font-medium">{sesion.porcentaje_completado || 0}%</p>
                                                        </div>
                                                    </div>

                                                    {sesionSeleccionada === sesion.id && sesion.notas && (
                                                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                            <p className="text-sm font-medium mb-1">Notas:</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {sesion.notas}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <CalendarIcon className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No hay sesiones registradas
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filtros.fecha_inicio || filtros.fecha_fin || filtros.rutina_id
                                ? 'Intenta ajustar los filtros para ver más resultados'
                                : 'Comienza tu primera sesión de entrenamiento'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
        </Layout>
    );
};

export default HistorialSesiones;
