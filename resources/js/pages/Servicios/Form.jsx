import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Save, ArrowLeft } from 'lucide-react';

const ServicioForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: '',
        tipo_servicio: 'plan_alimenticio',
        duracion_dias: '',
        costo: '',
        descripcion: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            fetchServicio();
        }
    }, [id]);

    const fetchServicio = async () => {
        try {
            const response = await api.get(`/servicios/${id}`);
            const servicio = response.data.data || response.data;
            setFormData({
                nombre: servicio.nombre || '',
                tipo_servicio: servicio.tipo_servicio || 'plan_alimenticio',
                duracion_dias: servicio.duracion_dias || '',
                costo: servicio.costo || '',
                descripcion: servicio.descripcion || ''
            });
            setLoadingData(false);
        } catch (error) {
            console.error('Error al cargar servicio:', error);
            alert('Error al cargar el servicio');
            navigate('/servicios');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!formData.tipo_servicio) {
            newErrors.tipo_servicio = 'El tipo de servicio es obligatorio';
        }

        if (!formData.duracion_dias || formData.duracion_dias <= 0) {
            newErrors.duracion_dias = 'La duración debe ser mayor a 0';
        }

        if (!formData.costo || formData.costo <= 0) {
            newErrors.costo = 'El costo debe ser mayor a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/servicios/${id}`, formData);
            } else {
                await api.post('/servicios', formData);
            }
            navigate('/servicios');
        } catch (error) {
            console.error('Error al guardar servicio:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al guardar el servicio');
            }
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Cargando servicio...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/servicios')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver a Servicios
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? 'Actualiza la información del servicio' : 'Completa los datos del nuevo servicio'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                    <div className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Servicio <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Plan Nutricional Mensual"
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                            )}
                        </div>

                        {/* Tipo de Servicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Servicio <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="tipo_servicio"
                                value={formData.tipo_servicio}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.tipo_servicio ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="plan_alimenticio">Plan Alimenticio</option>
                                <option value="asesoramiento">Asesoramiento</option>
                                <option value="catering">Catering</option>
                            </select>
                            {errors.tipo_servicio && (
                                <p className="mt-1 text-sm text-red-600">{errors.tipo_servicio}</p>
                            )}
                        </div>

                        {/* Duración y Costo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duración (días) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="duracion_dias"
                                    value={formData.duracion_dias}
                                    onChange={handleChange}
                                    min="1"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.duracion_dias ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="30"
                                />
                                {errors.duracion_dias && (
                                    <p className="mt-1 text-sm text-red-600">{errors.duracion_dias}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Costo ($) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="costo"
                                    value={formData.costo}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.costo ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="150.00"
                                />
                                {errors.costo && (
                                    <p className="mt-1 text-sm text-red-600">{errors.costo}</p>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe los beneficios y características del servicio..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/servicios')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {isEdit ? 'Actualizar' : 'Guardar'} Servicio
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ServicioForm;
