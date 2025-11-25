import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import ModeloAnatomico from '@/components/rutinas/ModeloAnatomico';
import Layout from '../../components/Layout';

const EjercicioDetalle = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ejercicio, setEjercicio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarEjercicio();
    }, [id]);

    const cargarEjercicio = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ejercicios/${id}`);
            setEjercicio(response.data);
        } catch (error) {
            console.error('Error al cargar ejercicio:', error);
            toast.error('Error al cargar el ejercicio');
            navigate('/rutinas/ejercicios');
        } finally {
            setLoading(false);
        }
    };

    const getNivelColor = (nivel) => {
        const colores = {
            principiante: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            intermedio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            avanzado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
        return colores[nivel] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando ejercicio...</p>
                </div>
            </div>
        );
    }

    if (!ejercicio) {
        return null;
    }

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{ejercicio.nombre}</h1>
                    <div className="flex gap-2 mt-2">
                        <Badge className={getNivelColor(ejercicio.nivel)}>
                            {ejercicio.nivel}
                        </Badge>
                        <Badge variant="outline">
                            {ejercicio.tipo_ejercicio}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video/Imagen */}
                    {ejercicio.video_url && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Play className="h-16 w-16 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Descripción */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Descripción</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300">
                                {ejercicio.descripcion}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Instrucciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Instrucciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="list-decimal list-inside space-y-2">
                                {ejercicio.instrucciones?.split('\n').map((paso, index) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                        {paso}
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>

                    {/* Consejos */}
                    {ejercicio.consejos && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Consejos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2">
                                    {ejercicio.consejos.split('\n').map((consejo, index) => (
                                        <li key={index} className="text-gray-700 dark:text-gray-300">
                                            {consejo}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Detalles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Grupo Muscular</p>
                                <p className="font-semibold">{ejercicio.grupo_muscular}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Equipamiento</p>
                                <p className="font-semibold">{ejercicio.equipamiento || 'Sin equipamiento'}</p>
                            </div>
                            {ejercicio.calorias_por_minuto && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Calorías/min</p>
                                    <p className="font-semibold">{ejercicio.calorias_por_minuto}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Modelo Anatómico */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Músculos Trabajados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ModeloAnatomico 
                                grupoMuscular={ejercicio.grupo_muscular}
                                musculosSecundarios={ejercicio.musculos_secundarios}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </Layout>
    );
};

export default EjercicioDetalle;
