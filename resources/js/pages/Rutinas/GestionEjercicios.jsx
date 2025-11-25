import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

const GestionEjercicios = () => {
    const navigate = useNavigate();
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [ejercicioEliminar, setEjercicioEliminar] = useState(null);
    const [paginacion, setPaginacion] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    useEffect(() => {
        cargarEjercicios();
    }, [busqueda, filtroNivel, filtroTipo]);

    const cargarEjercicios = async (pagina = 1) => {
        try {
            setLoading(true);
            const params = {
                page: pagina,
                search: busqueda || undefined,
                nivel: filtroNivel || undefined,
                tipo: filtroTipo || undefined
            };

            Object.keys(params).forEach(key => {
                if (params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await api.get('/ejercicios', { params });
            const listado = response?.data?.data ?? response?.data;
            setEjercicios(Array.isArray(listado) ? listado : Array.isArray(response?.data?.data) ? response.data.data : []);
            setPaginacion({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error al cargar ejercicios:', error);
            toast.error('Error al cargar ejercicios');
        } finally {
            setLoading(false);
        }
    };

    const confirmarEliminar = (ejercicio) => {
        setEjercicioEliminar(ejercicio);
    };

    const eliminarEjercicio = async () => {
        if (!ejercicioEliminar) return;

        try {
            await api.delete(`/ejercicios/${ejercicioEliminar.id}`);
            toast.success('Ejercicio eliminado correctamente');
            setEjercicioEliminar(null);
            cargarEjercicios(paginacion.current_page);
        } catch (error) {
            console.error('Error al eliminar ejercicio:', error);
            toast.error('Error al eliminar el ejercicio');
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

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'fuerza': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'cardio': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'flexibilidad': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'equilibrio': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
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
                        Gestión de Ejercicios
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Administra la biblioteca de ejercicios del sistema
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/rutinas/ejercicios/crear')}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Ejercicio
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="fuerza">Fuerza</option>
                            <option value="cardio">Cardio</option>
                            <option value="flexibilidad">Flexibilidad</option>
                            <option value="equilibrio">Equilibrio</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Ejercicios ({paginacion.total})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                        </div>
                    ) : ejercicios.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Nivel</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Grupos Musculares</TableHead>
                                            <TableHead>Duración</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ejercicios.map((ejercicio) => (
                                            <TableRow key={ejercicio.id}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <p className="font-semibold">{ejercicio.nombre}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                            {ejercicio.descripcion}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getNivelColor(ejercicio.nivel_dificultad)}>
                                                        {ejercicio.nivel_dificultad}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getTipoColor(ejercicio.tipo_ejercicio)}>
                                                        {ejercicio.tipo_ejercicio}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ejercicio.grupos_musculares && ejercicio.grupos_musculares.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {ejercicio.grupos_musculares.slice(0, 2).map((grupo) => (
                                                                <span
                                                                    key={grupo.id}
                                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                                                                    style={{
                                                                        backgroundColor: grupo.color_hex + '20',
                                                                        color: grupo.color_hex
                                                                    }}
                                                                >
                                                                    {grupo.nombre}
                                                                </span>
                                                            ))}
                                                            {ejercicio.grupos_musculares.length > 2 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +{ejercicio.grupos_musculares.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {ejercicio.duracion_estimada || 5} min
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/rutinas/ejercicios/${ejercicio.id}`)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/rutinas/ejercicios/${ejercicio.id}/editar`)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => confirmarEliminar(ejercicio)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Paginación */}
                            {paginacion.last_page > 1 && (
                                <div className="flex justify-center items-center space-x-2 mt-6">
                                    <Button
                                        variant="outline"
                                        disabled={paginacion.current_page === 1}
                                        onClick={() => cargarEjercicios(paginacion.current_page - 1)}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Página {paginacion.current_page} de {paginacion.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={paginacion.current_page === paginacion.last_page}
                                        onClick={() => cargarEjercicios(paginacion.current_page + 1)}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                No se encontraron ejercicios
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de confirmación */}
            <Dialog open={!!ejercicioEliminar} onOpenChange={() => setEjercicioEliminar(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el ejercicio "{ejercicioEliminar?.nombre}"?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEjercicioEliminar(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={eliminarEjercicio}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </Layout>
    );
};

export default GestionEjercicios;
