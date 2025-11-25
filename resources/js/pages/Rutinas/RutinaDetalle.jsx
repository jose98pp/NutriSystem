import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Clock, Target, Calendar, TrendingUp, Dumbbell } from 'lucide-react';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

const RutinaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rutina, setRutina] = useState(null);
    const [loading, setLoading] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [rutinaResponse, historialResponse, estadisticasResponse] = await Promise.all([
                api.get(`/rutinas/${id}`),
                api.get(`/sesiones-entrenamiento`, { params: { rutina_id: id } }),
                api.get(`/sesiones-entrenamiento/estadisticas`, { params: { rutina_id: id } })
            ]);
            
            setRutina(rutinaResponse.data);
            setHistorial(historialResponse.data.data || []);
            setEstadisticas(estadisticasResponse.data);
        } catch (error) {
            console.error('Error al cargar rutina:', error);
            toast.error('Error al cargar la rutina');
            navigate('/rutinas');
        } finally {
            setLoading(false);
        }
    };

    const iniciarEntrenamiento = async () => {
        try {
            const response = await api.post('/sesiones-entrenamiento', {
                rutina_paciente_id: rutina.id
            });
            
            toast.success('¡Sesión iniciada! ¡A entrenar!');
            navigate(`/rutinas/sesion/${response.data.id}`);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            toast.error('Error al iniciar la sesión de entrenamiento');
        }
    };

    const getNivelColor = (nivel) => {
        switch (nivel) {
            case 'principiante': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'intermedio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'avanzado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatearDias = (dias) => {
        if (!dias || !Array.isArray(dias)) return 'No programado';
        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return dias.map(dia => nombresDias[dia]).join(', ');
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                </div>
            </div>
        );
    }

    if (!rutina) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Rutina no encontrada
                </h2>
                <Button onClick={() => navigate('/rutinas')}>
                    Volver a mis rutinas
                </Button>
            </div>
        );
    }

    const progreso = rutina.progreso || { sesiones_completadas: 0, sesiones_totales: 0, porcentaje: 0 };

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/rutinas')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {rutina.rutina?.nombre || rutina.nombre}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {rutina.rutina?.descripcion || rutina.descripcion}
                        </p>
                    </div>
                </div>
                <Button
                    size="lg"
                    onClick={iniciarEntrenamiento}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <Play className="w-5 h-5" />
                    Iniciar Entrenamiento
                </Button>
            </div>

            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Duración</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {rutina.rutina?.duracion_estimada || 0} min
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Ejercicios</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {rutina.rutina?.ejercicios?.length || 0}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Dumbbell className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Frecuencia</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {rutina.rutina?.frecuencia_semanal || 0}x
                                </p>
                                <p className="text-xs text-gray-500">por semana</p>
                            </div>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Progreso</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {progreso.porcentaje}%
                                </p>
                                <p className="text-xs text-gray-500">
                                    {progreso.sesiones_completadas}/{progreso.sesiones_totales}
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progreso visual */}
            {progreso.sesiones_totales > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Progreso de la Rutina</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {progreso.sesiones_completadas} de {progreso.sesiones_totales} sesiones completadas
                                </span>
                                <span className="font-medium">{progreso.porcentaje}%</span>
                            </div>
                            <Progress value={progreso.porcentaje} className="h-3" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs con contenido */}
            <Tabs defaultValue="ejercicios" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
                    <TabsTrigger value="programacion">Programación</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="ejercicios" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Ejercicios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {rutina.rutina?.ejercicios && rutina.rutina.ejercicios.length > 0 ? (
                                <div className="space-y-4">
                                    {rutina.rutina.ejercicios.map((ejercicio, index) => (
                                        <div
                                            key={ejercicio.id}
                                            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/rutinas/ejercicios/${ejercicio.id}`)}
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                                {index + 1}
                                            </div>
                                            
                                            {ejercicio.imagen_principal && (
                                                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                    <img
                                                        src={ejercicio.imagen_principal}
                                                        alt={ejercicio.nombre}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg">{ejercicio.nombre}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {ejercicio.descripcion}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge className={getNivelColor(ejercicio.nivel_dificultad)}>
                                                        {ejercicio.nivel_dificultad}
                                                    </Badge>
                                                    {ejercicio.pivot?.series && (
                                                        <Badge variant="outline">
                                                            {ejercicio.pivot.series} series
                                                        </Badge>
                                                    )}
                                                    {ejercicio.pivot?.repeticiones && (
                                                        <Badge variant="outline">
                                                            {ejercicio.pivot.repeticiones} reps
                                                        </Badge>
                                                    )}
                                                    {ejercicio.pivot?.duracion_segundos && (
                                                        <Badge variant="outline">
                                                            {ejercicio.pivot.duracion_segundos}s
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                {ejercicio.pivot?.descanso_segundos && (
                                                    <div className="text-sm text-gray-500">
                                                        <p>Descanso:</p>
                                                        <p className="font-medium">{ejercicio.pivot.descanso_segundos}s</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No hay ejercicios en esta rutina
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="programacion" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Programación Semanal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Días de entrenamiento
                                </label>
                                <p className="text-lg font-semibold mt-1">
                                    {formatearDias(rutina.dias_semana)}
                                </p>
                            </div>

                            {rutina.hora_recordatorio && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Hora de recordatorio
                                    </label>
                                    <p className="text-lg font-semibold mt-1">
                                        {rutina.hora_recordatorio}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Objetivo
                                </label>
                                <p className="text-lg font-semibold mt-1 flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    {rutina.rutina?.objetivo || 'No especificado'}
                                </p>
                            </div>

                            {rutina.notas && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Notas del nutricionista
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        {rutina.notas}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="historial" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Sesiones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {historial.length > 0 ? (
                                <div className="space-y-3">
                                    {historial.map((sesion) => (
                                        <div
                                            key={sesion.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {new Date(sesion.fecha_inicio).toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Duración: {sesion.duracion_minutos || 0} minutos
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    className={
                                                        sesion.completada
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                    }
                                                >
                                                    {sesion.completada ? 'Completada' : 'Incompleta'}
                                                </Badge>
                                                {sesion.calorias_quemadas > 0 && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {sesion.calorias_quemadas} cal
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Aún no has completado ninguna sesión de esta rutina
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={iniciarEntrenamiento}
                                    >
                                        Iniciar Primera Sesión
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {estadisticas && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {estadisticas.sesiones_completadas || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Sesiones completadas
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {Math.round((estadisticas.tiempo_total_minutos || 0) / 60)}h
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Tiempo total
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {estadisticas.calorias_totales || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Calorías quemadas
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {estadisticas.racha_actual || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Racha (días)
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
        </Layout>
    );
};

export default RutinaDetalle;
