import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar usuario desde localStorage al iniciar
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            const parsed = JSON.parse(storedUser);
            if (parsed?.role === 'paciente' && !localStorage.getItem('onboardingComplete')) {
                localStorage.setItem('onboardingComplete', 'false');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const params = new URLSearchParams();
            params.append('email', email);
            params.append('password', password);
            const response = await api.post('/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            const { user, access_token } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            if (user?.role === 'paciente' && !localStorage.getItem('onboardingComplete')) {
                localStorage.setItem('onboardingComplete', 'false');
            }
            return { success: true };
        } catch (error) {
            // Log the raw error for easier debugging in development
            console.error('Login error:', error);

            // Determinar mensaje de error más descriptivo
            let errorMessage = 'Error al iniciar sesión';
            
            if (!error.response) {
                // Error de red - servidor no responde
                errorMessage = 'No se pudo conectar con el servidor. Verifica que el servidor esté corriendo.';
                console.error('🔴 Servidor no disponible. Ejecuta: php artisan serve');
            } else if (error.response.status === 422 || error.response.status === 401) {
                // Credenciales incorrectas
                errorMessage = error.response.data?.message || 'Credenciales incorrectas';
            } else if (error.response.status >= 500) {
                // Error del servidor
                errorMessage = 'Error en el servidor. Por favor, intenta más tarde.';
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                errorMessage = 'La conexión tardó demasiado. Verifica tu conexión a internet.';
            } else {
                // Otros errores
                errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const register = async (userData) => {
        try {
            const params = new URLSearchParams();
            if (userData?.name) params.append('name', userData.name);
            if (userData?.email) params.append('email', userData.email);
            if (userData?.telefono) params.append('telefono', userData.telefono);
            if (userData?.password) params.append('password', userData.password);
            if (userData?.passwordConfirmation) params.append('password_confirmation', userData.passwordConfirmation);
            if (userData?.fecha_nacimiento) params.append('fecha_nacimiento', userData.fecha_nacimiento);
            if (userData?.genero) params.append('genero', userData.genero);
            if (userData?.id_nutricionista) params.append('id_nutricionista', userData.id_nutricionista);
            const response = await api.post('/register', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });
            const { user, access_token } = response.data;
            
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            if (user?.role === 'paciente') {
                localStorage.setItem('onboardingComplete', 'false');
            }
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Error al registrarse' 
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAdmin = () => user?.role === 'admin';
    const isNutricionista = () => user?.role === 'nutricionista';
    const isPaciente = () => user?.role === 'paciente';

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            updateUser,
            loading,
            isAdmin,
            isNutricionista,
            isPaciente
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
