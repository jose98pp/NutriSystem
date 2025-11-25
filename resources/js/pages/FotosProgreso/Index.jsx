import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Camera, Upload, Image as ImageIcon, TrendingUp, 
    Calendar, User, Scale, Trash2, CheckCircle,
    X, ArrowUp, ArrowDown
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

const FotosProgresoIndex = () => {
    const { user, isNutricionista, isPaciente, isAdmin } = useAuth();
    const toast = useToast();
    const confirm = useConfirm();
    const [fotos, setFotos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [filter, setFilter] = useState('todas'); // todas, antes, durante, despues

    const [formData, setFormData] = useState({
        id_paciente: '',
        titulo: '',
        descripcion: '',
        tipo: 'durante',
        peso_kg: '',
        fecha: new Date().toISOString().split('T')[0],
        foto: null
    });

    useEffect(() => {
        if (isNutricionista() || isAdmin()) {
            fetchPacientes();
        } else if (isPaciente()) {
            // Obtener el id_paciente del usuario
            const idPaciente = user.paciente?.id_paciente || user.id_paciente;
            setSelectedPaciente(idPaciente);
            fetchFotos(idPaciente);
        }
    }, []);

    useEffect(() => {
        if (selectedPaciente) {
            fetchFotos(selectedPaciente);
        }
    }, [selectedPaciente, filter]);

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    };

    const fetchFotos = async (pacienteId) => {
        setLoading(true);
        try {
            const params = filter !== 'todas' ? { tipo: filter } : {};
            const response = await api.get(`/fotos-progreso/paciente/${pacienteId}`, { params });
            setFotos(response.data);
        } catch (error) {
            console.error('Error al cargar fotos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, foto: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        const idPaciente = isPaciente() ? selectedPaciente : formData.id_paciente;
        data.append('id_paciente', idPaciente);
        data.append('titulo', formData.titulo);
        data.append('descripcion', formData.descripcion);
        data.append('tipo', formData.tipo);
        data.append('peso_kg', formData.peso_kg || '');
        data.append('fecha', formData.fecha);
        data.append('foto', formData.foto);

        try {
            await api.post('/fotos-progreso', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Foto subida exitosamente');
            setShowUploadModal(false);
            setFormData({
                id_paciente: '',
                titulo: '',
                descripcion: '',
                tipo: 'durante',
                peso_kg: '',
                fecha: new Date().toISOString().split('T')[0],
                foto: null
            });
            fetchFotos(selectedPaciente);
        } catch (error) {
            console.error('Error al subir foto:', error);
            toast.error(error.response?.data?.message || 'Error al subir la foto');
        }
    };

    const handleDelete = async (id) => {
        const foto = fotos.find(f => f.id_foto === id);
        
        const confirmed = await confirm({
            title: 'Eliminar Foto',
            message: `¿Estás seguro de que deseas eliminar "${foto?.titulo}"?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/fotos-progreso/${id}`);
            toast.success('Foto eliminada exitosamente');
            fetchFotos(selectedPaciente);
        } catch (error) {
            console.error('Error al eliminar foto:', error);
            toast.error('Error al eliminar la foto');
        }
    };

    const tipoConfig = {
        antes: {
            label: 'Antes',
            icon: ImageIcon,
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-800 dark:text-blue-400',
            border: 'border-blue-500',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        durante: {
            label: 'Durante',
            icon: TrendingUp,
            gradient: 'from-yellow-500 to-orange-500',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-800 dark:text-yellow-400',
            border: 'border-yellow-500',
            iconColor: 'text-yellow-600 dark:text-yellow-400'
        },
        despues: {
            label: 'Después',
            icon: CheckCircle,
            gradient: 'from-green-500 to-emerald-500',
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-800 dark:text-green-400',
            border: 'border-green-500',
            iconColor: 'text-green-600 dark:text-green-400'
        }
    };

    const getTipoConfig = (tipo) => tipoConfig[tipo] || tipoConfig.durante;

    // Calcular estadísticas
    const stats = {
        total: fotos.length,
        antes: fotos.filter(f => f.tipo === 'antes').length,
        durante: fotos.filter(f => f.tipo === 'durante').length,
        despues: fotos.filter(f => f.tipo === 'despues').length,
        ultimaFoto: fotos.length > 0 ? fotos[0]?.fecha : null,
        cambioPeso: (() => {
            const fotosConPeso = fotos.filter(f => f.peso_kg);
            if (fotosConPeso.length < 2) return null;
            const primera = fotosConPeso[fotosConPeso.length - 1];
            const ultima = fotosConPeso[0];
            return (primera.peso_kg - ultima.peso_kg).toFixed(1);
        })()
    };

    const filteredFotos = filter === 'todas' 
        ? fotos 
        : fotos.filter(f => f.tipo === filter);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Fotos de Progreso</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Seguimiento visual de la transformación</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={(isNutricionista() || isAdmin()) && !selectedPaciente}
                    >
                        <Upload size={20} />
                        Subir Foto
                    </button>
                </div>

                {/* Stats Cards */}
                {selectedPaciente && fotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                                <Camera className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Antes</span>
                                <ImageIcon className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.antes}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Durante</span>
                                <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.durante}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Después</span>
                                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.despues}</p>
                        </div>

                        {stats.cambioPeso && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Cambio</span>
                                    <Scale className="text-purple-600 dark:text-purple-400" size={20} />
                                </div>
                                <p className={`text-2xl font-bold ${stats.cambioPeso > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {stats.cambioPeso > 0 ? '-' : '+'}{Math.abs(stats.cambioPeso)} kg
                                </p>
                            </div>
                        )}

                        {stats.ultimaFoto && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Última</span>
                                    <Calendar className="text-gray-600 dark:text-gray-400" size={20} />
                                </div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    {new Date(stats.ultimaFoto).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Selector de Paciente (solo nutricionista) */}
                {(isNutricionista() || isAdmin()) && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <User size={16} className="inline mr-2" />
                            Seleccionar Paciente
                        </label>
                        <select
                            value={selectedPaciente || ''}
                            onChange={(e) => setSelectedPaciente(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">-- Selecciona un paciente --</option>
                            {pacientes.map((p) => (
                                <option key={p.id_paciente} value={p.id_paciente}>
                                    {p.nombre} {p.apellido} - {p.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Filtros */}
                {selectedPaciente && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setFilter('todas')}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                    filter === 'todas'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Camera size={16} />
                                Todas ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('antes')}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                    filter === 'antes'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <ImageIcon size={16} />
                                Antes ({stats.antes})
                            </button>
                            <button
                                onClick={() => setFilter('durante')}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                    filter === 'durante'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <TrendingUp size={16} />
                                Durante ({stats.durante})
                            </button>
                            <button
                                onClick={() => setFilter('despues')}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                    filter === 'despues'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <CheckCircle size={16} />
                                Después ({stats.despues})
                            </button>
                            <button
                                onClick={() => setShowComparison(true)}
                                className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <TrendingUp size={16} />
                                Ver Comparación
                            </button>
                        </div>
                    </div>
                )}

                {/* Galería de Fotos */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando fotos...</p>
                    </div>
                ) : !selectedPaciente && (isNutricionista() || isAdmin()) ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md text-center py-12">
                        <User className="mx-auto mb-4 text-gray-400" size={64} />
                        <p className="text-gray-600 dark:text-gray-400">Selecciona un paciente para ver sus fotos</p>
                    </div>
                ) : filteredFotos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md text-center py-12">
                        <Camera className="mx-auto mb-4 text-gray-400" size={64} />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No hay fotos</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Aún no se han subido fotos de progreso</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            <Upload size={20} />
                            Subir Primera Foto
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFotos.map((foto) => {
                            const config = getTipoConfig(foto.tipo);
                            const IconComponent = config.icon;
                            
                            return (
                                <div key={foto.id_foto} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {/* Imagen */}
                                    <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${foto.foto_url}`}
                                            alt={foto.titulo}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Badge de tipo */}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.bg} ${config.text}`}>
                                                <IconComponent size={14} />
                                                {config.label}
                                            </span>
                                        </div>
                                        
                                        {/* Indicador de peso */}
                                        {foto.peso_kg && (
                                            <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-gray-800/95 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <Scale size={14} className="text-purple-600 dark:text-purple-400" />
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{foto.peso_kg} kg</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{foto.titulo}</h3>
                                        {foto.descripcion && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {foto.descripcion}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            <Calendar size={14} />
                                            {new Date(foto.fecha).toLocaleDateString('es-ES', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                        
                                        {/* Acciones */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(foto.id_foto)}
                                                className="flex-1 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal de Subir Foto */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Upload size={24} />
                                        Subir Foto de Progreso
                                    </h3>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {(isNutricionista() || isAdmin()) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paciente *</label>
                                            <select
                                                name="id_paciente"
                                                value={formData.id_paciente}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                required
                                            >
                                                <option value="">Selecciona un paciente</option>
                                                {pacientes.map((p) => (
                                                    <option key={p.id_paciente} value={p.id_paciente}>
                                                        {p.nombre} {p.apellido}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Ej: Primera semana de transformación"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            rows="3"
                                            placeholder="Agrega detalles sobre esta foto..."
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo *</label>
                                            <select
                                                name="tipo"
                                                value={formData.tipo}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                required
                                            >
                                                <option value="antes">Antes</option>
                                                <option value="durante">Durante</option>
                                                <option value="despues">Después</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Peso (kg)</label>
                                            <input
                                                type="number"
                                                name="peso_kg"
                                                value={formData.peso_kg}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                step="0.1"
                                                min="20"
                                                max="300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha *</label>
                                            <input
                                                type="date"
                                                name="fecha"
                                                value={formData.fecha}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto * (máx 5MB)</label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <Upload size={18} />
                                            Subir Foto
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Comparación Antes/Después */}
                {showComparison && selectedPaciente && (
                    <ComparacionModal
                        pacienteId={selectedPaciente}
                        onClose={() => setShowComparison(false)}
                    />
                )}
            </div>
        </Layout>
    );
};

// Componente de Comparación
const ComparacionModal = ({ pacienteId, onClose }) => {
    const [comparacion, setComparacion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComparacion();
    }, []);

    const fetchComparacion = async () => {
        try {
            const response = await api.get(`/fotos-progreso/comparacion/${pacienteId}`);
            setComparacion(response.data);
        } catch (error) {
            console.error('Error al cargar comparación:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <TrendingUp size={24} />
                            Comparación Antes/Después
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando comparación...</p>
                        </div>
                    ) : !comparacion.antes || !comparacion.despues ? (
                        <div className="text-center py-12">
                            <Camera className="mx-auto mb-4 text-gray-400" size={64} />
                            <p className="text-gray-600 dark:text-gray-400">
                                No hay suficientes fotos para comparar. 
                                <br />
                                Se necesita al menos una foto "Antes" y una "Después"
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Foto Antes */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-center text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                                        <ImageIcon size={20} />
                                        ANTES
                                    </h4>
                                    <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-500">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${comparacion.antes.foto_url}`}
                                            alt="Antes"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-center space-y-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{comparacion.antes.titulo}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(comparacion.antes.fecha).toLocaleDateString('es-ES', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                        {comparacion.antes.peso_kg && (
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                                                <Scale size={20} />
                                                {comparacion.antes.peso_kg} kg
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Foto Después */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-center text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                                        <CheckCircle size={20} />
                                        DESPUÉS
                                    </h4>
                                    <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-green-500">
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${comparacion.despues.foto_url}`}
                                            alt="Después"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-center space-y-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{comparacion.despues.titulo}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(comparacion.despues.fecha).toLocaleDateString('es-ES', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                        {comparacion.despues.peso_kg && (
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                                                <Scale size={20} />
                                                {comparacion.despues.peso_kg} kg
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            {comparacion.diferencia_peso !== null && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
                                    <div className="text-center">
                                        <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                                            <TrendingUp size={20} />
                                            Progreso Total
                                        </h4>
                                        <div className="flex items-center justify-center gap-3 mb-3">
                                            {comparacion.diferencia_peso > 0 ? (
                                                <ArrowDown className="text-green-600 dark:text-green-400" size={48} />
                                            ) : (
                                                <ArrowUp className="text-red-600 dark:text-red-400" size={48} />
                                            )}
                                            <div className={`text-5xl font-bold ${comparacion.diferencia_peso > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {comparacion.diferencia_peso > 0 ? '-' : '+'}{Math.abs(comparacion.diferencia_peso)} kg
                                            </div>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-lg">
                                            {comparacion.diferencia_peso > 0 
                                                ? '¡Excelente pérdida de peso!' 
                                                : '¡Ganancia de masa muscular!'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FotosProgresoIndex;
