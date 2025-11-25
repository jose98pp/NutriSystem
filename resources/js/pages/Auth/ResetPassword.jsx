import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../config/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (token && email) {
            verifyToken();
        } else {
            setError('Link inválido o incompleto');
            setVerifying(false);
        }
    }, [token, email]);

    const verifyToken = async () => {
        try {
            const response = await api.post('/verify-reset-token', { token, email });
            if (response.data.success) {
                setTokenValid(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'El link de recuperación es inválido o ha expirado');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('email', email);
            params.append('password', formData.password);
            params.append('password_confirmation', formData.password_confirmation);
            const response = await api.post('/reset-password', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verificando link...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Link Inválido
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error || 'El link de recuperación es inválido o ha expirado'}
                        </p>
                        
                        <Link
                            to="/forgot-password"
                            className="btn-primary w-full inline-block"
                        >
                            Solicitar Nuevo Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            ¡Contraseña Restablecida!
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Tu contraseña ha sido actualizada exitosamente.
                            Serás redirigido al login en unos segundos...
                        </p>
                        
                        <Link
                            to="/login"
                            className="btn-primary w-full inline-block"
                        >
                            Ir al Login Ahora
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fadeIn">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Nueva Contraseña
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Ingresa tu nueva contraseña
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-shake">
                                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Mínimo 8 caracteres
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Restableciendo...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Restablecer Contraseña
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
