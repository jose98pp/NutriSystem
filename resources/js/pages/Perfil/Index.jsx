import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { User, Mail, Phone, Calendar, Lock, Save, Camera, Shield, Bell, Palette, Trash2 } from 'lucide-react';
import api from '../../config/api';

const Perfil = () => {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        fecha_nacimiento: user?.fecha_nacimiento || '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [preferences, setPreferences] = useState({
        dark_mode: user?.preferences?.dark_mode || false,
        animations: user?.preferences?.animations !== false,
        language: user?.preferences?.language || 'es',
    });

    const [notifications, setNotifications] = useState({
        email_messages: user?.notification_settings?.email_messages !== false,
        email_reminders: user?.notification_settings?.email_reminders !== false,
        email_updates: user?.notification_settings?.email_updates || false,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                telefono: user.telefono || '',
                fecha_nacimiento: user.fecha_nacimiento || '',
            });
            setPreferences({
                dark_mode: user.preferences?.dark_mode || false,
                animations: user.preferences?.animations !== false,
                language: user.preferences?.language || 'es',
            });
            setNotifications({
                email_messages: user.notification_settings?.email_messages !== false,
                email_reminders: user.notification_settings?.email_reminders !== false,
                email_updates: user.notification_settings?.email_updates || false,
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await api.put('/perfil', formData);
            updateUser(response.data.user);
            toast.success('Perfil actualizado exitosamente');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 2MB');
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await api.post('/perfil/foto', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updateUser(response.data.user);
            toast.success('Foto de perfil actualizada');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al subir la foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

        setUploadingPhoto(true);
        try {
            const response = await api.delete('/perfil/foto');
            updateUser(response.data.user);
            toast.success('Foto de perfil eliminada');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar la foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);
        
        try {
            await api.put('/perfil/password', passwordData);
            toast.success('Contraseña actualizada exitosamente');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesUpdate = async (key, value) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        try {
            await api.put('/perfil/preferencias', { [key]: value });
            toast.success('Preferencia actualizada');
        } catch (error) {
            toast.error('Error al actualizar preferencia');
            setPreferences(preferences); // Revertir
        }
    };

    const handleNotificationsUpdate = async (key, value) => {
        const newNotifications = { ...notifications, [key]: value };
        setNotifications(newNotifications);

        try {
            await api.put('/perfil/notificaciones', { [key]: value });
            toast.success('Configuración actualizada');
        } catch (error) {
            toast.error('Error al actualizar configuración');
            setNotifications(notifications); // Revertir
        }
    };

    const getPhotoUrl = () => {
        if (!user?.foto_perfil) return null;
        
        // Si ya es una URL completa, retornarla
        if (user.foto_perfil.startsWith('http')) {
            return user.foto_perfil;
        }
        
        // Construir URL completa
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        return `${baseUrl}/storage/${user.foto_perfil}`;
    };

    const tabs = [
        { id: 'personal', label: 'Información Personal', icon: User },
        { id: 'security', label: 'Seguridad', icon: Shield },
        { id: 'preferences', label: 'Preferencias', icon: Palette },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
    ];

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mi Perfil</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Gestiona tu información personal y preferencias
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="card-gradient animate-fadeIn">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            {getPhotoUrl() ? (
                                <img
                                    src={getPhotoUrl()}
                                    alt={user?.name}
                                    className="w-24 h-24 rounded-2xl object-cover shadow-xl"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform disabled:opacity-50"
                            >
                                {uploadingPhoto ? (
                                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                            {user?.foto_perfil && (
                                <button
                                    onClick={handleDeletePhoto}
                                    disabled={uploadingPhoto}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                                >
                                    <Trash2 className="w-3 h-3 text-white" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                            <div className="flex gap-2 mt-3 justify-center md:justify-start">
                                <span className="badge badge-success capitalize">{user?.role}</span>
                                <span className="badge badge-info">Cuenta Activa</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {Math.floor((new Date() - new Date(user?.created_at)) / (1000 * 60 * 60 * 24))}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Días Activo</div>
                            </div>
                            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {user?.email_verified_at ? '100%' : '80%'}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Completado</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="card p-0 overflow-hidden">
                    <div className="flex gap-2 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6">
                        {/* Tab: Información Personal */}
                        {activeTab === 'personal' && (
                            <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre Completo
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-field pl-12"
                                                placeholder="Tu nombre"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Correo Electrónico
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="input-field pl-12"
                                                placeholder="tu@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                className="input-field pl-12"
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Fecha de Nacimiento
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={formData.fecha_nacimiento}
                                                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                                                className="input-field pl-12"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: Seguridad */}
                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordChange} className="space-y-6 animate-fadeIn">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Contraseña Actual
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                className="input-field pl-12"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                className="input-field pl-12"
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Mínimo 8 caracteres
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Confirmar Nueva Contraseña
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwordData.new_password_confirmation}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                                className="input-field pl-12"
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <Shield className="w-5 h-5" />
                                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: Preferencias */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="card-gradient p-6">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Palette className="w-5 h-5" />
                                        Apariencia
                                    </h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Modo Oscuro</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Activa el tema oscuro</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={preferences.dark_mode}
                                                onChange={(e) => handlePreferencesUpdate('dark_mode', e.target.checked)}
                                                className="w-5 h-5 text-primary-600 rounded"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Animaciones</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Habilita transiciones suaves</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={preferences.animations}
                                                onChange={(e) => handlePreferencesUpdate('animations', e.target.checked)}
                                                className="w-5 h-5 text-primary-600 rounded"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="card-gradient p-6">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Idioma</h3>
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => handlePreferencesUpdate('language', e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Tab: Notificaciones */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="card-gradient p-6">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Bell className="w-5 h-5" />
                                        Notificaciones por Email
                                    </h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Nuevos mensajes</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Recibe notificaciones de mensajes</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.email_messages}
                                                onChange={(e) => handleNotificationsUpdate('email_messages', e.target.checked)}
                                                className="w-5 h-5 text-primary-600 rounded"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Recordatorios de comidas</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Recordatorios de tu plan alimenticio</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.email_reminders}
                                                onChange={(e) => handleNotificationsUpdate('email_reminders', e.target.checked)}
                                                className="w-5 h-5 text-primary-600 rounded"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">Actualizaciones del sistema</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Novedades y mejoras</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.email_updates}
                                                onChange={(e) => handleNotificationsUpdate('email_updates', e.target.checked)}
                                                className="w-5 h-5 text-primary-600 rounded"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Perfil;
