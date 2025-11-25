import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles, Heart, TrendingUp } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Mostrar mensaje de éxito si viene del registro
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Limpiar el mensaje después de 5 segundos
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleOAuth = (provider) => {
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        window.location.href = `${baseUrl}/oauth/${provider}/redirect`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side - Branding */}
                <div className="hidden md:block text-white space-y-8 animate-fadeIn">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">NutriSystem</h1>
                                <p className="text-white/80 text-sm">Gestión Nutricional Inteligente</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Seguimiento en Tiempo Real</h3>
                                <p className="text-white/70 text-sm">Monitorea el progreso de tus pacientes con métricas detalladas</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Planes Personalizados</h3>
                                <p className="text-white/70 text-sm">Crea planes alimenticios adaptados a cada necesidad</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-sm text-white/60">
                        <div>
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div>Pacientes Activos</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">50+</div>
                            <div>Nutricionistas</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">98%</div>
                            <div>Satisfacción</div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 animate-fadeIn">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Bienvenido de nuevo
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {successMessage && (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-6 animate-fadeIn">
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 animate-fadeIn">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Contraseña
                                </label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Ingresando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button type="button" disabled={loading} className="btn-outline" onClick={() => handleOAuth('google')}>Continuar con Google</button>
                        <button type="button" disabled={loading} className="btn-outline" onClick={() => handleOAuth('facebook')}>Continuar con Facebook</button>
                    </div>

                    <div className="mt-8 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Usuarios de prueba:
                        </p>
                        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="font-medium">Nutricionista:</span>
                                <code className="text-primary-600 dark:text-primary-400">carlos@nutricion.com</code>
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span className="font-medium">Paciente:</span>
                                <code className="text-primary-600 dark:text-primary-400">juan@example.com</code>
                            </div>
                            <p className="text-center pt-2 text-gray-500 dark:text-gray-500">
                                Contraseña: <code className="font-semibold">password</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
