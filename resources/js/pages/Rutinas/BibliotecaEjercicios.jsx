import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import EjercicioCard from '@/components/rutinas/EjercicioCard';
import Layout from '../../components/Layout';

const BibliotecaEjercicios = () => {
    const navigate = useNavigate();
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');
    const [filtroGrupoMuscular, setFiltroGrupoMuscular] = useState('');

    useEffect(() => {
        cargarEjercicios();
    }, [busqueda, filtroNivel, filtroGrupoMuscular]);

    const cargarEjercicios = async () => {
        try {
            setLoading(true);
            const params = {
                search: busqueda || undefined,
                nivel: filtroNivel || undefined,
                grupo_muscular: filtroGrupoMuscular || undefined
            };
            Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

            const response = await api.get('/ejercicios', { params });
            const posibleLista = response?.data?.data ?? response?.data;
            const lista = Array.isArray(posibleLista)
                ? posibleLista
                : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : [];
            if (!Array.isArray(lista)) {
                toast.error('Error al cargar ejercicios');
            }
            setEjercicios(lista);
        } catch (error) {
            console.error('Error al cargar ejercicios:', error);
            toast.error('Error al cargar la biblioteca de ejercicios');
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = (id) => {
        navigate(`/rutinas/ejercicios/${id}`);
    };

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Biblioteca de Ejercicios</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Explora nuestra colección de ejercicios
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar ejercicios..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <select
                            value={filtroNivel}
                            onChange={(e) => setFiltroNivel(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="">Todos los niveles</option>
                            <option value="principiante">Principiante</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="avanzado">Avanzado</option>
                        </select>

                        <select
                            value={filtroGrupoMuscular}
                            onChange={(e) => setFiltroGrupoMuscular(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="">Todos los grupos</option>
                            <option value="pecho">Pecho</option>
                            <option value="espalda">Espalda</option>
                            <option value="piernas">Piernas</option>
                            <option value="brazos">Brazos</option>
                            <option value="hombros">Hombros</option>
                            <option value="core">Core</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Grid de Ejercicios */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando ejercicios...</p>
                </div>
            ) : ejercicios.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400">No se encontraron ejercicios</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ejercicios.map((ejercicio) => (
                        <EjercicioCard
                            key={ejercicio.id}
                            ejercicio={ejercicio}
                            onVerDetalle={verDetalle}
                        />
                    ))}
                </div>
            )}
        </div>
        </Layout>
    );
};

export default BibliotecaEjercicios;
