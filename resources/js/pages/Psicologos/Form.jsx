import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { Brain, Save, ArrowLeft, Upload, X } from 'lucide-react';
import api from '../../config/api';

const PsicologoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        cedula_profesional: '',
        especialidad: '',
        telefono: '',
        estado: 'ACTIVO'
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) {
            fetchPsicologo();
        }
    }, [id]);

    const fetchPsicologo = async () => {
        try {
            const response = await api.get(`/psicologos/${id}`);
            const psicologo = response.data.data;
            
            setFormData({
                nombre: psicologo.nombre || '',
                apellido: psicologo.apellido || '',
                email: psicologo.user?.email || '',
                password: '',
                cedula_profesional: psicologo.cedula_profesional || '',
                especialidad: psicologo.especialidad || '',
                telefono: psicologo.telefono || '',
                estado: psicologo.estado || 'ACTIVO'
            });

            if (psicologo.foto_perfil) {
                setFotoPreview(`/storage/${psicologo.foto_perfil}`);
            }
        } catch (error) {
            console.error('Error al cargar psicólogo:', error);
            toast.error('❌ Error al cargar datos del psicólogo');
            navigate('/psicologos');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('❌ Solo se permiten archivos de imagen');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                toast.error('❌ La imagen no debe superar los 2MB');
                return;
            }

            setFotoFile(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setFotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFoto = () => {
        setFotoFile(null);
        setFotoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const submitData = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            if (fotoFile) {
                submitData.append('foto_perfil', fotoFile);
            }

            let response;
            if (isEditing) {
                submitData.append('_method', 'PUT');
                response = await api.post(`/psicologos/${id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await api.post('/psicologos', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            toast.success(`✅ Psicólogo ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
            navigate('/psicologos');

        } catch (error) {
            console.error('Error al guardar psicólogo:', error);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error('❌ Por favor corrige los errores en el formulario');
            } else {
                toast.error(`❌ Error al ${isEditing ? 'actualizar' : 'crear'} psicólogo`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/psicologos')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {isEditing ? 'Editar Psicólogo' : 'Nuevo Psicólogo'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {isEditing ? 'Actualiza la información del psicólogo' : 'Registra un nuevo psicólogo en el sistema'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Información Personal */}
                        <div className="lg:col-span-2">
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    Información Personal
                                </h3>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className={`input ${errors.nombre ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.nombre && (
                                            <p className="text-red-500 text-sm mt-1">{errors.nombre[0]}</p>
                                        )}
                                    </div>

                                    {/* Apellido */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            className={`input ${errors.apellido ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.apellido && (
                                            <p className="text-red-500 text-sm mt-1">{errors.apellido[0]}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`input ${errors.email ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Contraseña {!isEditing && '*'}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`input ${errors.password ? 'border-red-500' : ''}`}
                                            required={!isEditing}
                                            placeholder={isEditing ? 'Dejar vacío para mantener actual' : ''}
                                        />
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
                                        )}
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className={`input ${errors.telefono ? 'border-red-500' : ''}`}
                                        />
                                        {errors.telefono && (
                                            <p className="text-red-500 text-sm mt-1">{errors.telefono[0]}</p>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Estado
                                        </label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleInputChange}
                                            className="input"
                                        >
                                            <option value="ACTIVO">Activo</option>
                                            <option value="INACTIVO">Inactivo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Información Profesional */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    Información Profesional
                                </h3>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Cédula Profesional */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cédula Profesional
                                        </label>
                                        <input
                                            type="text"
                                            name="cedula_profesional"
                                            value={formData.cedula_profesional}
                                            onChange={handleInputChange}
                                            className={`input ${errors.cedula_profesional ? 'border-red-500' : ''}`}
                                        />
                                        {errors.cedula_profesional && (
                                            <p className="text-red-500 text-sm mt-1">{errors.cedula_profesional[0]}</p>
                                        )}
                                    </div>

                                    {/* Especialidad */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Especialidad
                                        </label>
                                        <input
                                            type="text"
                                            name="especialidad"
                                            value={formData.especialidad}
                                            onChange={handleInputChange}
                                            className={`input ${errors.especialidad ? 'border-red-500' : ''}`}
                                            placeholder="Ej: Psicología Clínica, Terapia Cognitiva..."
                                        />
                                        {errors.especialidad && (
                                            <p className="text-red-500 text-sm mt-1">{errors.especialidad[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Foto de Perfil */}
                        <div>
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    Foto de Perfil
                                </h3>
                                
                                <div className="space-y-4">
                                    {fotoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={fotoPreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-xl mx-auto"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeFoto}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto flex items-center justify-center">
                                            <Brain className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFotoChange}
                                                className="hidden"
                                            />
                                            <div className="btn-secondary cursor-pointer flex items-center justify-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                Subir Foto
                                            </div>
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                            Máximo 2MB. JPG, PNG, GIF
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/psicologos')}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    {isEditing ? 'Actualizando...' : 'Creando...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Actualizar' : 'Crear'} Psicólogo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default PsicologoForm;
