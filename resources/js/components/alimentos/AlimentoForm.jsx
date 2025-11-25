import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../config/api';

/**
 * Componente para crear y editar alimentos
 * Feature: mejoras-sistema-core, Tarea 5.6
 */
const AlimentoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        nombre: '',
        categoria: 'otro',
        calorias_por_100g: '',
        proteinas_por_100g: '',
        carbohidratos_por_100g: '',
        grasas_por_100g: '',
        fibra_por_100g: '',
        sodio_por_100g: '',
        azucares_por_100g: '',
        grasas_saturadas_por_100g: '',
        grasas_monoinsaturadas_por_100g: '',
        grasas_poliinsaturadas_por_100g: '',
        colesterol_por_100g: '',
        vitamina_a_por_100g: '',
        vitamina_c_por_100g: '',
        calcio_por_100g: '',
        hierro_por_100g: '',
        disponible: true,
        descripcion: '',
        restricciones: ''
    });

    const categorias = [
        { value: 'fruta', label: 'Fruta' },
        { value: 'verdura', label: 'Verdura' },
        { value: 'cereal', label: 'Cereal' },
        { value: 'proteina', label: 'Proteína' },
        { value: 'lacteo', label: 'Lácteo' },
        { value: 'grasa', label: 'Grasa' },
        { value: 'otro', label: 'Otro' }
    ];

    useEffect(() => {
        if (id) {
            fetchAlimento();
        }
    }, [id]);

    const fetchAlimento = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/alimentos/${id}`);
            const alimento = response.data.data || response.data;
            setFormData(alimento);
        } catch (error) {
            console.error('Error al cargar alimento:', error);
            toast.error('Error al cargar el alimento');
            navigate('/alimentos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validaciones requeridas
        if (!formData.nombre || formData.nombre.trim() === '') {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.categoria) {
            newErrors.categoria = 'La categoría es requerida';
        }

        // Validar que los valores nutricionales sean números positivos
        const camposNumericos = [
            'calorias_por_100g', 'proteinas_por_100g', 'carbohidratos_por_100g', 
            'grasas_por_100g', 'fibra_por_100g', 'sodio_por_100g', 'azucares_por_100g',
            'grasas_saturadas_por_100g', 'grasas_monoinsaturadas_por_100g', 
            'grasas_poliinsaturadas_por_100g', 'colesterol_por_100g',
            'vitamina_a_por_100g', 'vitamina_c_por_100g', 'calcio_por_100g', 'hierro_por_100g'
        ];

        camposNumericos.forEach(campo => {
            const valor = formData[campo];
            if (valor !== '' && valor !== null && valor !== undefined) {
                const numero = parseFloat(valor);
                if (isNaN(numero) || numero < 0) {
                    newErrors[campo] = 'Debe ser un número positivo';
                }
            }
        });

        // Validar campos requeridos de macronutrientes
        const camposRequeridos = ['calorias_por_100g', 'proteinas_por_100g', 'carbohidratos_por_100g', 'grasas_por_100g'];
        camposRequeridos.forEach(campo => {
            if (!formData[campo] || formData[campo] === '') {
                newErrors[campo] = 'Este campo es requerido';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        setLoading(true);

        try {
            // Preparar datos para enviar
            const dataToSend = { ...formData };
            
            // Convertir valores numéricos
            const camposNumericos = [
                'calorias_por_100g', 'proteinas_por_100g', 'carbohidratos_por_100g', 
                'grasas_por_100g', 'fibra_por_100g', 'sodio_por_100g', 'azucares_por_100g',
                'grasas_saturadas_por_100g', 'grasas_monoinsaturadas_por_100g', 
                'grasas_poliinsaturadas_por_100g', 'colesterol_por_100g',
                'vitamina_a_por_100g', 'vitamina_c_por_100g', 'calcio_por_100g', 'hierro_por_100g'
            ];

            camposNumericos.forEach(campo => {
                if (dataToSend[campo] !== '' && dataToSend[campo] !== null && dataToSend[campo] !== undefined) {
                    dataToSend[campo] = parseFloat(dataToSend[campo]);
                } else {
                    dataToSend[campo] = null;
                }
            });

            if (id) {
                await api.put(`/alimentos/${id}`, dataToSend);
                toast.success('Alimento actualizado exitosamente');
            } else {
                await api.post('/alimentos', dataToSend);
                toast.success('Alimento creado exitosamente');
            }

            navigate('/alimentos');
        } catch (error) {
            console.error('Error al guardar alimento:', error);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error('Por favor corrige los errores en el formulario');
            } else {
                toast.error(error.response?.data?.message || 'Error al guardar el alimento');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {id ? 'Editar Alimento' : 'Nuevo Alimento'}
                </h1>
                <p className="text-gray-600 mt-2">
                    {id ? 'Modifica la información del alimento' : 'Completa la información nutricional del alimento'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información Básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Manzana verde"
                                    className={errors.nombre ? 'border-red-500' : ''}
                                />
                                {errors.nombre && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="categoria">Categoría *</Label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.categoria ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    {categorias.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                {errors.categoria && (
                                    <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Descripción del alimento..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="disponible"
                                name="disponible"
                                checked={formData.disponible}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <Label htmlFor="disponible" className="cursor-pointer">
                                Disponible para usar en planes
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Macronutrientes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Macronutrientes (por 100g) *</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="calorias_por_100g">Calorías (kcal) *</Label>
                                <Input
                                    id="calorias_por_100g"
                                    name="calorias_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.calorias_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.calorias_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.calorias_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.calorias_por_100g}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="proteinas_por_100g">Proteínas (g) *</Label>
                                <Input
                                    id="proteinas_por_100g"
                                    name="proteinas_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.proteinas_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.proteinas_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.proteinas_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.proteinas_por_100g}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="carbohidratos_por_100g">Carbohidratos (g) *</Label>
                                <Input
                                    id="carbohidratos_por_100g"
                                    name="carbohidratos_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.carbohidratos_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.carbohidratos_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.carbohidratos_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.carbohidratos_por_100g}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="grasas_por_100g">Grasas (g) *</Label>
                                <Input
                                    id="grasas_por_100g"
                                    name="grasas_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.grasas_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.grasas_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.grasas_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.grasas_por_100g}</p>
                                )}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="fibra_por_100g">Fibra (g)</Label>
                                <Input
                                    id="fibra_por_100g"
                                    name="fibra_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.fibra_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.fibra_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.fibra_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fibra_por_100g}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="sodio_por_100g">Sodio (mg)</Label>
                                <Input
                                    id="sodio_por_100g"
                                    name="sodio_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.sodio_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.sodio_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.sodio_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.sodio_por_100g}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="azucares_por_100g">Azúcares (g)</Label>
                                <Input
                                    id="azucares_por_100g"
                                    name="azucares_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.azucares_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.azucares_por_100g ? 'border-red-500' : ''}
                                />
                                {errors.azucares_por_100g && (
                                    <p className="text-red-500 text-sm mt-1">{errors.azucares_por_100g}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="grasas_saturadas_por_100g">Grasas Saturadas (g)</Label>
                                <Input
                                    id="grasas_saturadas_por_100g"
                                    name="grasas_saturadas_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.grasas_saturadas_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.grasas_saturadas_por_100g ? 'border-red-500' : ''}
                                />
                            </div>

                            <div>
                                <Label htmlFor="grasas_monoinsaturadas_por_100g">Grasas Monoinsaturadas (g)</Label>
                                <Input
                                    id="grasas_monoinsaturadas_por_100g"
                                    name="grasas_monoinsaturadas_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.grasas_monoinsaturadas_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="grasas_poliinsaturadas_por_100g">Grasas Poliinsaturadas (g)</Label>
                                <Input
                                    id="grasas_poliinsaturadas_por_100g"
                                    name="grasas_poliinsaturadas_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.grasas_poliinsaturadas_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="colesterol_por_100g">Colesterol (mg)</Label>
                                <Input
                                    id="colesterol_por_100g"
                                    name="colesterol_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.colesterol_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="vitamina_a_por_100g">Vitamina A (μg)</Label>
                                <Input
                                    id="vitamina_a_por_100g"
                                    name="vitamina_a_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.vitamina_a_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="vitamina_c_por_100g">Vitamina C (mg)</Label>
                                <Input
                                    id="vitamina_c_por_100g"
                                    name="vitamina_c_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.vitamina_c_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="calcio_por_100g">Calcio (mg)</Label>
                                <Input
                                    id="calcio_por_100g"
                                    name="calcio_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.calcio_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="hierro_por_100g">Hierro (mg)</Label>
                                <Input
                                    id="hierro_por_100g"
                                    name="hierro_por_100g"
                                    type="number"
                                    step="0.01"
                                    value={formData.hierro_por_100g}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Restricciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Restricciones y Alergias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label htmlFor="restricciones">Restricciones</Label>
                            <textarea
                                id="restricciones"
                                name="restricciones"
                                value={formData.restricciones}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Ej: Contiene gluten, lácteos, frutos secos..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Indica si el alimento contiene alérgenos o restricciones dietéticas
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/alimentos')}
                        disabled={loading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {id ? 'Actualizar' : 'Crear'} Alimento
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AlimentoForm;
