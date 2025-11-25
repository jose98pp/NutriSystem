import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Save, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

const ChangePassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
        setSuccess(false);
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.current_password) {
            newErrors.current_password = 'La contraseña actual es obligatoria';
        }

        if (!formData.password) {
            newErrors.password = 'La nueva contraseña es obligatoria';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Confirma la nueva contraseña';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }

        if (formData.current_password === formData.password) {
            newErrors.password = 'La nueva contraseña debe ser diferente a la actual';
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
            await api.put('/perfil/cambiar-password', formData);
            setSuccess(true);
            setFormData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
            setTimeout(() => {
                navigate('/perfil');
            }, 2000);
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ current_password: error.response.data.message });
            } else {
                alert('Error al cambiar la contraseña');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/perfil')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver al Perfil
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Cambiar Contraseña</h1>
                    <p className="text-gray-600 mt-1">Actualiza tu contraseña de acceso</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            ✓ Contraseña actualizada exitosamente. Redirigiendo...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña Actual <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.current_password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Tu contraseña actual"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.current_password && (
                                <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nueva Contraseña <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                La contraseña debe tener al menos 8 caracteres
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* Security Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Consejos de Seguridad:</h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Usa una combinación de letras mayúsculas y minúsculas</li>
                                <li>• Incluye números y caracteres especiales</li>
                                <li>• Evita usar información personal obvia</li>
                                <li>• No reutilices contraseñas de otras cuentas</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/perfil')}
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
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Cambiar Contraseña
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ChangePassword;
