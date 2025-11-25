import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { logApiError } from '../../utils/logger';

const NutricionistaForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const toast = useToast();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        especialidad: '',
        password: '',
        password_confirmation: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            fetchNutricionista();
        }
    }, [id]);

    const fetchNutricionista = async () => {
        try {
            const response = await api.get(`/nutricionistas/${id}`);
            const nutricionista = response.data.data || response.data;
            setFormData({
                nombre: nutricionista.nombre || '',
                apellido: nutricionista.apellido || '',
                email: nutricionista.email || '',
                telefono: nutricionista.telefono || '',
                especialidad: nutricionista.especialidad || '',
                password: '',
                password_confirmation: ''
            });
            setLoadingData(false);
        } catch (error) {
            logApiError(`/nutricionistas/${id}`, error);
            toast.error('Error al cargar el nutricionista');
            navigate('/nutricionistas');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es obligatorio';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (!isEdit) {
            if (!formData.password) {
                newErrors.password = 'La contraseña es obligatoria';
            } else if (formData.password.length < 8) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
            }

            if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Las contraseñas no coinciden';
            }
        } else if (formData.password) {
            if (formData.password.length < 8) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
            }
            if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Las contraseñas no coinciden';
            }
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
            const dataToSend = { ...formData };
            
            // Remove password fields if empty in edit mode
            if (isEdit && !dataToSend.password) {
                delete dataToSend.password;
                delete dataToSend.password_confirmation;
            }

            if (isEdit) {
                await api.put(`/nutricionistas/${id}`, dataToSend);
                toast.success('Nutricionista actualizado exitosamente');
            } else {
                await api.post('/nutricionistas', dataToSend);
                toast.success('Nutricionista creado exitosamente');
            }
            navigate('/nutricionistas');
        } catch (error) {
            logApiError(isEdit ? `/nutricionistas/${id}` : '/nutricionistas', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error('Por favor corrige los errores en el formulario');
            } else {
                toast.error('Error al guardar el nutricionista');
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
                        <p className="mt-4 text-gray-600">Cargando nutricionista...</p>
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
                        onClick={() => navigate('/nutricionistas')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver a Nutricionistas
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isEdit ? 'Editar Nutricionista' : 'Nuevo Nutricionista'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? 'Actualiza la información del nutricionista' : 'Completa los datos del nuevo nutricionista'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                    <div className="space-y-6">
                        {/* Información Personal */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.nombre ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Juan"
                                    />
                                    {errors.nombre && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apellido <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.apellido ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Pérez"
                                    />
                                    {errors.apellido && (
                                        <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="nutricionista@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+1234567890"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información Profesional */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Profesional</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Especialidad
                                </label>
                                <input
                                    type="text"
                                    name="especialidad"
                                    value={formData.especialidad}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Nutrición Deportiva, Nutrición Clínica, etc."
                                />
                            </div>
                        </div>

                        {/* Credenciales */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Credenciales de Acceso {isEdit && <span className="text-sm font-normal text-gray-500">(Dejar en blanco para mantener la contraseña actual)</span>}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña {!isEdit && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Contraseña {!isEdit && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Confirma la contraseña"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/nutricionistas')}
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
                                    {isEdit ? 'Actualizar' : 'Guardar'} Nutricionista
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default NutricionistaForm;
