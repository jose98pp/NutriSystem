import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import RutinaCard from '@/components/rutinas/RutinaCard';
import EstadisticasProgreso from '@/components/rutinas/EstadisticasProgreso';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const MisRutinas = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [rutinas, setRutinas] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [rutinasRes, estadisticasRes] = await Promise.all([
                api.get('/rutinas/mis-rutinas'),
                api.get('/rutinas/estadisticas')
            ]);

            const listado = rutinasRes?.data?.data ?? rutinasRes?.data;
            setRutinas(Array.isArray(listado) ? listado : Array.isArray(rutinasRes?.data?.data) ? rutinasRes.data.data : []);
            setEstadisticas(estadisticasRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar tus rutinas');
        } finally {
            setLoading(false);
        }
    };

    const iniciarSesion = (rutinaId) => {
        navigate(`/rutinas/sesion/${rutinaId}`);
    };

    const verDetalle = (rutinaId) => {
        navigate(`/rutinas/${rutinaId}`);
    };

    const verHistorial = () => {
        navigate('/rutinas/historial');
    };

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Rutinas</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gestiona y realiza tus rutinas de ejercicio
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={verHistorial}
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Historial
                    </Button>
                    <Button onClick={() => navigate('/rutinas/ejercicios')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Explorar Ejercicios
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <EstadisticasProgreso estadisticas={estadisticas} />
            )}

            {/* Rutinas Activas */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Rutinas Activas</h2>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando rutinas...</p>
                    </div>
                ) : rutinas.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tienes rutinas asignadas</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Tu nutricionista aún no te ha asignado ninguna rutina de ejercicios
                            </p>
                            <Button onClick={() => navigate('/rutinas/ejercicios')}>
                                Explorar Ejercicios
                            </Button>
                            {user?.role !== 'paciente' && (
                                <Button className="ml-2" onClick={() => navigate('/rutinas/crear')}>
                                    Crear Rutina
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rutinas.map((rutina) => (
                            <RutinaCard
                                key={rutina.id}
                                rutina={rutina}
                                onIniciar={iniciarSesion}
                                onVerDetalle={verDetalle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Próxima Sesión */}
            {rutinas.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">¿Listo para entrenar?</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Continúa con tu próxima sesión programada
                                </p>
                            </div>
                            <Button size="lg" onClick={() => iniciarSesion(rutinas[0].id)}>
                                <Play className="h-5 w-5 mr-2" />
                                Comenzar Ahora
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        </Layout>
    );
};

export default MisRutinas;
