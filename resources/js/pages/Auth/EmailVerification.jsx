import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw, Heart } from 'lucide-react';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (token && email) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('Enlace de verificación inválido');
        }
    }, [token, email]);

    const verifyEmail = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, token })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                setMessage(data.message);
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login', { 
                        state: { message: 'Email verificado exitosamente. Ya puedes iniciar sesión.' } 
                    });
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Error al verificar el email');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Error de conexión. Por favor intenta nuevamente.');
        }
    };

    const resendVerification = async () => {
        if (!email) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage('Email de verificación reenviado. Por favor revisa tu bandeja de entrada.');
            } else {
                setMessage(data.message || 'Error al reenviar el email');
            }
        } catch (err) {
            setMessage('Error de conexión. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                                <Heart className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Verificación de Email
                        </h1>
                    </div>

                    {/* Status Content */}
                    <div className="text-center">
                        {status === 'verifying' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Verificando tu correo electrónico...
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle className="w-20 h-20 text-green-500" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                    ¡Email Verificado!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {message}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Redirigiendo al login...
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <XCircle className="w-20 h-20 text-red-500" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                    Error de Verificación
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {message}
                                </p>
                                
                                {email && (
                                    <button
                                        onClick={resendVerification}
                                        disabled={loading}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Reenviando...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-5 h-5" />
                                                Reenviar Email de Verificación
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <Link 
                            to="/login" 
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                            Volver al login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
