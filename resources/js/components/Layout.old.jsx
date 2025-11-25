import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { User, Moon, Sun, HelpCircle, LogOut, ChevronDown } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout, isAdmin, isNutricionista, isPaciente } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Menú dinámico según rol
    const menuItems = [
        { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'nutricionista', 'paciente'] },
        
        // Admin y Nutricionista
        { path: '/pacientes', label: 'Pacientes', icon: '👥', roles: ['admin', 'nutricionista'] },
        { path: '/nutricionistas', label: 'Nutricionistas', icon: '👨‍⚕️', roles: ['admin'] },
        { path: '/servicios', label: 'Servicios', icon: '🎯', roles: ['admin', 'nutricionista'] },
        { path: '/contratos', label: 'Contratos', icon: '📝', roles: ['admin', 'nutricionista'] },
        { path: '/alimentos', label: 'Alimentos', icon: '🍎', roles: ['admin', 'nutricionista'] },
        { path: '/recetas', label: 'Recetas', icon: '🍽️', roles: ['admin', 'nutricionista'] },
        { path: '/evaluaciones', label: 'Evaluaciones', icon: '📈', roles: ['admin', 'nutricionista'] },
        { path: '/analisis-clinicos', label: 'Análisis Clínicos', icon: '🔬', roles: ['admin', 'nutricionista'] },
        { path: '/direcciones', label: 'Direcciones', icon: '📍', roles: ['admin', 'nutricionista'] },
        { path: '/calendarios-entrega', label: 'Calendarios', icon: '📆', roles: ['admin', 'nutricionista'] },
        { path: '/entregas', label: 'Entregas', icon: '📦', roles: ['admin', 'nutricionista'] },
        { path: '/reportes', label: 'Reportes', icon: '📉', roles: ['admin', 'nutricionista'] },
        
        // Común para todos
        { path: '/planes', label: 'Planes', icon: '📋', roles: ['admin', 'nutricionista', 'paciente'] },
        { path: '/ingestas', label: 'Ingestas', icon: '🥗', roles: ['admin', 'nutricionista', 'paciente'] },
        { path: '/fotos-progreso', label: 'Fotos Progreso', icon: '📸', roles: ['admin', 'nutricionista', 'paciente'] },
        
        // Solo Pacientes
        { path: '/mis-comidas-hoy', label: 'Mis Comidas de Hoy', icon: '🍽️', roles: ['paciente'] },
        { path: '/mi-menu-semanal', label: 'Mi Menú Semanal', icon: '📅', roles: ['paciente'] },
        { path: '/mis-direcciones', label: 'Mis Direcciones', icon: '📍', roles: ['paciente'] },
        { path: '/mis-recetas', label: 'Mis Recetas', icon: '🥘', roles: ['paciente'] },
        { path: '/mis-analisis', label: 'Mis Análisis', icon: '🔬', roles: ['paciente'] },
        { path: '/mi-calendario', label: 'Mi Calendario', icon: '📆', roles: ['paciente'] },
        { path: '/mis-entregas', label: 'Mis Entregas', icon: '📦', roles: ['paciente'] },
        
        // Footer
        { path: '/mensajes', label: 'Mensajes', icon: '💬', roles: ['admin', 'nutricionista', 'paciente'] },
        //{ path: '/perfil', label: 'Perfil', icon: '👤', roles: ['admin', 'nutricionista', 'paciente'] },
        //{ path: '/cerrar-sesion', label: 'Cerrar Sesión', icon: '🔒', roles: ['admin', 'nutricionista', 'paciente'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300`}>
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h1 className={`font-bold text-primary-600 dark:text-primary-400 ${!sidebarOpen && 'hidden'}`}>
                            Sistema Nutrición
                        </h1>
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                            {sidebarOpen ? '←' : '→'}
                        </button>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    {filteredMenu.map((item) => {
                        // Si es el botón de cerrar sesión, renderizar como button
                        if (item.path === '/cerrar-sesion') {
                            return (
                                <button
                                    key={item.path}
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left text-gray-700 dark:text-gray-300"
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                </button>
                            );
                        }
                        
                        // Para los demás items, renderizar como Link
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-gray-700 dark:text-gray-300"
                            >
                                <span className="text-2xl">{item.icon}</span>
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
                    <div className="px-8 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                Bienvenido, {user?.name}
                            </h2>
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date().toLocaleDateString('es-ES', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                                
                                {/* Menú de Perfil */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {profileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                            <Link
                                                to="/perfil"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            >
                                                <User size={18} />
                                                <span>Mi Perfil</span>
                                            </Link>
                                            
                                            <button
                                                onClick={() => {
                                                    toggleDarkMode();
                                                    setProfileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            >
                                                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                                            </button>
                                            
                                            <Link
                                                to="/ayuda"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                            >
                                                <HelpCircle size={18} />
                                                <span>Ayuda</span>
                                            </Link>
                                            
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                            
                                            <button
                                                onClick={() => {
                                                    setProfileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                            >
                                                <LogOut size={18} />
                                                <span>Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
