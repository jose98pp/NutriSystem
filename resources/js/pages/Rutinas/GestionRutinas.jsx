import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

const GestionRutinas = () => {
    const navigate = useNavigate();
    const [rutinas, setRutinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        search: '',
        nivel: ''
    });

    useEffect(() => {
        cargarRutinas();
    }, [filtros]);

    const cargarRutinas = async () => {
        try {
            setLoading(true);
            const params = {
                search: filtros.search || undefined,
                nivel: filtros.nivel || undefined
            };

            Object.keys(params).forEach(key => {
                if (params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await api.get('/rutinas', { params });
            const listado = response?.data?.data ?? response?.data;
            const array = Array.isArray(listado)
                ? listado
                : Array.isArray(listado?.data)
                    ? listado.data
                    : [];
            setRutinas(array);
        } catch (error) {
            console.error('Error al cargar rutinas:', error);
            toast.error('Error al cargar las rutinas');
        } finally {
            setLoading(false);
        }
    };

    const eliminarRutina = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta rutina?')) {
            return;
        }

        try {
            await api.delete(`/rutinas/${id}`);
            toast.success('Rutina eliminada correctamente');
            cargarRutinas();
        } catch (error) {
            console.error('Error al eliminar rutina:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar la rutina');
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

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gestión de Rutinas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Crea y administra rutinas de ejercicios para tus pacientes
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/rutinas/crear')}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Rutina
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar rutinas..."
                                value={filtros.search}
                                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filtros.nivel}
                            onChange={(e) => setFiltros({ ...filtros, nivel: e.target.value })}
                            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Todos los niveles</option>
                            <option value="principiante">Principiante</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="avanzado">Avanzado</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de rutinas */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                        </div>
                    ))}
                </div>
            ) : rutinas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rutinas.map((rutina) => (
                        <Card key={rutina.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-semibold line-clamp-2">
                                        {rutina.nombre}
                                    </CardTitle>
                                    <Badge className={getNivelColor(rutina.nivel_dificultad)}>
                                        {rutina.nivel_dificultad}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {rutina.descripcion}
                                </p>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Ejercicios</p>
                                        <p className="font-medium">{rutina.ejercicios?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Duración</p>
                                        <p className="font-medium">{rutina.duracion_estimada || 0} min</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Frecuencia</p>
                                        <p className="font-medium">{rutina.frecuencia_semanal || 0}x/sem</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Objetivo</p>
                                        <p className="font-medium text-xs">{rutina.objetivo || 'N/A'}</p>
                                    </div>
                                </div>

                                {rutina.pacientes_count > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Users className="w-4 h-4" />
                                        <span>Asignada a {rutina.pacientes_count} paciente(s)</span>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => navigate(`/rutinas/${rutina.id}`)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Ver
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => navigate(`/rutinas/editar/${rutina.id}`)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => eliminarRutina(rutina.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                            <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No se encontraron rutinas
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Comienza creando tu primera rutina de ejercicios
                        </p>
                        <Button onClick={() => navigate('/rutinas/crear')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primera Rutina
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
        </Layout>
    );
};

export default GestionRutinas;
