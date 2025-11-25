import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { 
    Home, Users, UserCog, Target, FileText, Apple, UtensilsCrossed, 
    Activity, Microscope, MapPin, Calendar, Package, BarChart3, 
    ClipboardList, Salad, Camera, Utensils, CalendarDays, Map, 
    ChefHat, FlaskConical, CalendarCheck, Truck, MessageSquare,
    User, Moon, Sun, LogOut, ChevronDown, Menu, X, Heart, Settings,
    Dumbbell, TrendingUp
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout, isAdmin, isNutricionista, isPaciente } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Función para obtener la URL de la foto de perfil
    const getPhotoUrl = () => {
        if (!user?.foto_perfil) return null;
        
        if (user.foto_perfil.startsWith('http')) {
            return user.foto_perfil;
        }
        
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        return `${baseUrl}/storage/${user.foto_perfil}`;
    };

    // Componente para el avatar del usuario
    const UserAvatar = ({ size = 'md', className = '' }) => {
        const photoUrl = getPhotoUrl();
        const sizeClasses = {
            sm: 'w-8 h-8 text-sm',
            md: 'w-9 h-9 text-base',
            lg: 'w-10 h-10 text-lg'
        };

        if (photoUrl) {
            return (
                <img
                    src={photoUrl}
                    alt={user?.name}
                    className={`${sizeClasses[size]} rounded-full object-cover shadow-lg ${className}`}
                    onError={(e) => {
                        // Si falla la carga, mostrar iniciales
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            );
        }

        return (
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}>
                {user?.name?.charAt(0).toUpperCase()}
            </div>
        );
    };

    // Menú dinámico según rol con iconos de Lucide
    const menuItems = [
        { path: '/', label: 'Dashboard', icon: Home, roles: ['admin', 'nutricionista', 'paciente'] },
        
        // Admin y Nutricionista
        { path: '/pacientes', label: 'Pacientes', icon: Users, roles: ['admin', 'nutricionista'] },
        { path: '/nutricionistas', label: 'Nutricionistas', icon: UserCog, roles: ['admin'] },
        { path: '/servicios', label: 'Servicios', icon: Target, roles: ['admin', 'nutricionista'] },
        { path: '/contratos', label: 'Contratos', icon: FileText, roles: ['admin', 'nutricionista'] },
        { path: '/alimentos', label: 'Alimentos', icon: Apple, roles: ['admin', 'nutricionista'] },
        { path: '/recetas', label: 'Recetas', icon: UtensilsCrossed, roles: ['admin', 'nutricionista'] },
        { path: '/evaluaciones', label: 'Evaluaciones', icon: Activity, roles: ['admin', 'nutricionista'] },
        { path: '/analisis-clinicos', label: 'Análisis Clínicos', icon: Microscope, roles: ['admin', 'nutricionista'] },
        { path: '/direcciones', label: 'Direcciones', icon: MapPin, roles: ['admin', 'nutricionista'] },
        { path: '/calendarios-entrega', label: 'Calendarios', icon: Calendar, roles: ['admin', 'nutricionista'] },
        { path: '/sesiones', label: 'Sesiones', icon: Calendar, roles: ['admin', 'nutricionista', 'psicologo'] },
        { path: '/entregas', label: 'Entregas', icon: Package, roles: ['admin', 'nutricionista'] },
        { path: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['admin', 'nutricionista'] },
        
        // Planes - Solo Admin y Nutricionista
        { path: '/planes', label: 'Planes', icon: ClipboardList, roles: ['admin', 'nutricionista'] },
        
        // Común para todos
        { path: '/ingestas', label: 'Ingestas', icon: Salad, roles: ['admin', 'nutricionista', 'paciente'] },
        { path: '/fotos-progreso', label: 'Fotos Progreso', icon: Camera, roles: ['admin', 'nutricionista', 'paciente'] },
        
        // Solo Pacientes
        { path: '/mi-plan', label: 'Mi Plan', icon: Target, roles: ['paciente'] },
        { path: '/mis-sesiones', label: 'Mis Sesiones', icon: Calendar, roles: ['paciente'] },
        { path: '/mi-menu-semanal', label: 'Mi Menú Semanal', icon: CalendarDays, roles: ['paciente'] },
        { path: '/mis-comidas-hoy', label: 'Mis Comidas de Hoy', icon: Utensils, roles: ['paciente'] },
        { path: '/mis-direcciones', label: 'Mis Direcciones', icon: Map, roles: ['paciente'] },
        { path: '/mis-recetas', label: 'Mis Recetas', icon: ChefHat, roles: ['paciente'] },
        { path: '/mis-analisis', label: 'Mis Análisis', icon: FlaskConical, roles: ['paciente'] },
        { path: '/mi-calendario', label: 'Mi Calendario', icon: CalendarCheck, roles: ['paciente'] },
        { path: '/mis-entregas', label: 'Mis Entregas', icon: Truck, roles: ['paciente'] },
        
        // Rutinas y Ejercicios
        { path: '/rutinas', label: 'Mis Rutinas', icon: Dumbbell, roles: ['paciente'] },
        { path: '/rutinas/ejercicios', label: 'Ejercicios', icon: Activity, roles: ['admin', 'nutricionista', 'paciente'] },
        { path: '/rutinas/gestion', label: 'Gestión Rutinas', icon: ClipboardList, roles: ['admin', 'nutricionista'] },
        { path: '/rutinas/gestion-ejercicios', label: 'Gestión Ejercicios', icon: Settings, roles: ['admin'] },
        { path: '/rutinas/historial', label: 'Historial', icon: TrendingUp, roles: ['paciente'] },
        
        // Footer
        { path: '/mensajes', label: 'Mensajes', icon: MessageSquare, roles: ['admin', 'nutricionista', 'paciente', 'psicologo'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar Desktop */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden lg:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700/50 transition-all duration-300 sticky top-0 h-screen overflow-y-auto custom-scrollbar`}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                        {sidebarOpen ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800 dark:text-gray-100">NutriSystem</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {filteredMenu.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    active 
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                {sidebarOpen && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 mt-auto">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                            <UserAvatar size="lg" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
                        {/* Same content as desktop sidebar */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800 dark:text-gray-100">NutriSystem</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">v2.0</p>
                                    </div>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <nav className="p-4 space-y-2">
                            {filteredMenu.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            active 
                                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' 
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-40">
                    <div className="px-4 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Welcome Message */}
                            <div className="hidden lg:block">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                    Bienvenido, {user?.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date().toLocaleDateString('es-ES', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center gap-3">
                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                                </button>

                                {/* Notifications */}
                                <NotificationBell />

                                {/* Profile Menu */}
                                <div 
                                    className="relative group"
                                    onMouseEnter={() => setProfileMenuOpen(true)}
                                    onMouseLeave={() => setProfileMenuOpen(false)}
                                >
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group-hover:shadow-md"
                                    >
                                        <UserAvatar size="md" className="ring-2 ring-transparent group-hover:ring-primary-500 transition-all" />
                                        <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 hidden lg:block transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {/* Dropdown */}
                                    {profileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-fadeIn overflow-hidden">
                                            {/* Header con foto y datos */}
                                            <div className="px-4 py-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar size="lg" className="ring-2 ring-white dark:ring-gray-700 shadow-lg" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{user?.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full capitalize">
                                                            {user?.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    to="/perfil"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors group"
                                                >
                                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="font-medium">Mi Perfil</span>
                                                </Link>
                                                <Link
                                                    to="/configuracion"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors group"
                                                >
                                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                        <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <span className="font-medium">Configuración</span>
                                                </Link>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                            
                                            <button
                                                onClick={() => {
                                                    setProfileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
                                            >
                                                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
