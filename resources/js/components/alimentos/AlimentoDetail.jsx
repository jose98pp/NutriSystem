import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    AlertCircle, 
    CheckCircle,
    Info,
    TrendingUp,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../config/api';

/**
 * Componente para mostrar detalles completos de un alimento
 * Feature: mejoras-sistema-core, Tarea 5.7
 */
const AlimentoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alimento, setAlimento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usageInfo, setUsageInfo] = useState(null);
    const [loadingUsage, setLoadingUsage] = useState(false);

    useEffect(() => {
        fetchAlimento();
        fetchUsageInfo();
    }, [id]);

    const fetchAlimento = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/alimentos/${id}`);
            setAlimento(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar alimento:', error);
            toast.error('Error al cargar el alimento');
            navigate('/alimentos');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsageInfo = async () => {
        try {
            setLoadingUsage(true);
            const response = await api.get(`/alimentos/${id}/usage`);
            setUsageInfo(response.data);
        } catch (error) {
            console.error('Error al cargar información de uso:', error);
        } finally {
            setLoadingUsage(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este alimento?')) {
            return;
        }

        try {
            await api.delete(`/alimentos/${id}`);
            toast.success('Alimento eliminado exitosamente');
            navigate('/alimentos');
        } catch (error) {
            console.error('Error al eliminar alimento:', error);
            
            if (error.response?.status === 409) {
                toast.error('No se puede eliminar el alimento porque está siendo usado en planes activos');
            } else {
                toast.error(error.response?.data?.message || 'Error al eliminar el alimento');
            }
        }
    };

    const getCategoriaLabel = (categoria) => {
        const categorias = {
            'fruta': 'Fruta',
            'verdura': 'Verdura',
            'cereal': 'Cereal',
            'proteina': 'Proteína',
            'lacteo': 'Lácteo',
            'grasa': 'Grasa',
            'otro': 'Otro'
        };
        return categorias[categoria] || categoria;
    };

    const getCategoriaColor = (categoria) => {
        const colores = {
            'fruta': 'bg-red-100 text-red-800',
            'verdura': 'bg-green-100 text-green-800',
            'cereal': 'bg-yellow-100 text-yellow-800',
            'proteina': 'bg-blue-100 text-blue-800',
            'lacteo': 'bg-purple-100 text-purple-800',
            'grasa': 'bg-orange-100 text-orange-800',
            'otro': 'bg-gray-100 text-gray-800'
        };
        return colores[categoria] || colores['otro'];
    };

    const calcularDensidadNutricional = () => {
        if (!alimento) return 0;
        
        const calorias = alimento.calorias_por_100g || 0;
        if (calorias === 0) return 0;
        
        const proteinas = alimento.proteinas_por_100g || 0;
        const fibra = alimento.fibra_por_100g || 0;
        
        // Score simple basado en densidad nutricional
        const score = ((proteinas * 4 + fibra * 2) / calorias) * 100;
        return Math.min(100, Math.round(score));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!alimento) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró el alimento
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const densidadNutricional = calcularDensidadNutricional();

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Encabezado */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/alimentos')}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a alimentos
                </Button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {alimento.nombre}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Badge className={getCategoriaColor(alimento.categoria)}>
                                {getCategoriaLabel(alimento.categoria)}
                            </Badge>
                            {alimento.disponible ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Disponible
                                </Badge>
                            ) : (
                                <Badge variant="secondary">
                                    No disponible
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/alimentos/${id}/edit`)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Descripción */}
                    {alimento.descripcion && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Descripción
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{alimento.descripcion}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Macronutrientes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Macronutrientes (por 100g)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Calorías</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {Math.round(alimento.calorias_por_100g || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500">kcal</p>
                                </div>

                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Proteínas</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(alimento.proteinas_por_100g || 0).toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500">g</p>
                                </div>

                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Carbohidratos</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {(alimento.carbohidratos_por_100g || 0).toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500">g</p>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Grasas</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {(alimento.grasas_por_100g || 0).toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500">g</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información nutricional adicional */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Nutricional Adicional (por 100g)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {alimento.fibra_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Fibra</span>
                                        <span className="font-semibold">{alimento.fibra_por_100g.toFixed(1)}g</span>
                                    </div>
                                )}

                                {alimento.sodio_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Sodio</span>
                                        <span className="font-semibold">{alimento.sodio_por_100g.toFixed(1)}mg</span>
                                    </div>
                                )}

                                {alimento.azucares_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Azúcares</span>
                                        <span className="font-semibold">{alimento.azucares_por_100g.toFixed(1)}g</span>
                                    </div>
                                )}

                                {alimento.grasas_saturadas_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Grasas Saturadas</span>
                                        <span className="font-semibold">{alimento.grasas_saturadas_por_100g.toFixed(1)}g</span>
                                    </div>
                                )}

                                {alimento.grasas_monoinsaturadas_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Grasas Monoinsaturadas</span>
                                        <span className="font-semibold">{alimento.grasas_monoinsaturadas_por_100g.toFixed(1)}g</span>
                                    </div>
                                )}

                                {alimento.grasas_poliinsaturadas_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Grasas Poliinsaturadas</span>
                                        <span className="font-semibold">{alimento.grasas_poliinsaturadas_por_100g.toFixed(1)}g</span>
                                    </div>
                                )}

                                {alimento.colesterol_por_100g > 0 && (
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Colesterol</span>
                                        <span className="font-semibold">{alimento.colesterol_por_100g.toFixed(1)}mg</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Micronutrientes */}
                    {(alimento.vitamina_a_por_100g > 0 || alimento.vitamina_c_por_100g > 0 || 
                      alimento.calcio_por_100g > 0 || alimento.hierro_por_100g > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Micronutrientes (por 100g)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {alimento.vitamina_a_por_100g > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Vitamina A</span>
                                            <span className="font-semibold">{alimento.vitamina_a_por_100g.toFixed(1)}μg</span>
                                        </div>
                                    )}

                                    {alimento.vitamina_c_por_100g > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Vitamina C</span>
                                            <span className="font-semibold">{alimento.vitamina_c_por_100g.toFixed(1)}mg</span>
                                        </div>
                                    )}

                                    {alimento.calcio_por_100g > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Calcio</span>
                                            <span className="font-semibold">{alimento.calcio_por_100g.toFixed(1)}mg</span>
                                        </div>
                                    )}

                                    {alimento.hierro_por_100g > 0 && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Hierro</span>
                                            <span className="font-semibold">{alimento.hierro_por_100g.toFixed(1)}mg</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Restricciones */}
                    {alimento.restricciones && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    Restricciones y Alergias
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <AlertDescription>
                                        {alimento.restricciones}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Columna lateral */}
                <div className="space-y-6">
                    {/* Score de densidad nutricional */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Densidad Nutricional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                                densidadNutricional >= 70 ? 'text-green-600 bg-green-200' :
                                                densidadNutricional >= 40 ? 'text-yellow-600 bg-yellow-200' :
                                                'text-red-600 bg-red-200'
                                            }`}>
                                                {densidadNutricional >= 70 ? 'Excelente' :
                                                 densidadNutricional >= 40 ? 'Bueno' : 'Regular'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold inline-block text-gray-600">
                                                {densidadNutricional}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                        <div
                                            style={{ width: `${densidadNutricional}%` }}
                                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                                densidadNutricional >= 70 ? 'bg-green-500' :
                                                densidadNutricional >= 40 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Basado en la relación entre nutrientes y calorías
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de uso */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Uso en Planes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingUsage ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : usageInfo ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                        <span className="text-sm text-gray-600">Planes activos</span>
                                        <span className="font-semibold text-blue-600">
                                            {usageInfo.planes_activos || 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                        <span className="text-sm text-gray-600">Recetas</span>
                                        <span className="font-semibold text-green-600">
                                            {usageInfo.recetas || 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                                        <span className="text-sm text-gray-600">Total usos</span>
                                        <span className="font-semibold text-purple-600">
                                            {usageInfo.total_usos || 0}
                                        </span>
                                    </div>

                                    {usageInfo.en_uso && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-xs">
                                                Este alimento está siendo usado en planes activos y no puede ser eliminado
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No se pudo cargar la información de uso
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información adicional */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ID:</span>
                                <span className="font-medium">{alimento.id_alimento}</span>
                            </div>
                            {alimento.created_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Creado:</span>
                                    <span className="font-medium">
                                        {new Date(alimento.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {alimento.updated_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Actualizado:</span>
                                    <span className="font-medium">
                                        {new Date(alimento.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AlimentoDetail;
