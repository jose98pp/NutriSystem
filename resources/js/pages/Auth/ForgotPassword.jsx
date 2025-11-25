import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../../config/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('email', email);
            const response = await api.post('/forgot-password', params, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            
            if (response.data.success) {
                setSent(true);
            }
        } catch (err) {
            console.error('Error completo:', err);
            if (err.code === 'ECONNABORTED') {
                setError('La solicitud tardó demasiado. Por favor, verifica tu conexión e intenta nuevamente.');
            } else if (!err.response) {
                setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            } else {
                setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Error al enviar el correo');
            }
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            ¡Correo Enviado!
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Te hemos enviado un correo a <strong>{email}</strong> con las instrucciones para restablecer tu contraseña.
                        </p>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                📧 Revisa tu bandeja de entrada y también la carpeta de spam.
                                El link expira en 60 minutos.
                            </p>
                        </div>
                        
                        <Link
                            to="/login"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al Login
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
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            ¿Olvidaste tu Contraseña?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            No te preocupes, te enviaremos instrucciones para restablecerla
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
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="tu@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Ingresa el correo con el que te registraste
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Link de Recuperación
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

                {/* Info adicional */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
