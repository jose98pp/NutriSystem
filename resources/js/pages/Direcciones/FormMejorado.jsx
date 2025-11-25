import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import api from '../../config/api';
import { MapPin, Navigation, Search, Home, Briefcase, Building2, X } from 'lucide-react';

const DireccionesFormMejorado = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const toast = useToast();
    const mapRef = useRef(null);

    const [formData, setFormData] = useState({
        id_paciente: '',
        alias: '',
        descripcion: '',
        geo_lat: '',
        geo_lng: '',
    });

    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [errors, setErrors] = useState({});
    const [mapCenter, setMapCenter] = useState({ lat: -34.603722, lng: -58.381592 }); // Buenos Aires por defecto
    const [markerPosition, setMarkerPosition] = useState(null);

    // Aliases predefinidos
    const aliasPresets = [
        { icon: Home, label: 'Casa', value: 'casa' },
        { icon: Briefcase, label: 'Oficina', value: 'oficina' },
        { icon: Building2, label: 'Departamento', value: 'departamento' },
    ];

    useEffect(() => {
        fetchPacientes();
        if (isEdit) {
            fetchDireccion();
        } else {
            // Intentar obtener ubicación actual
            getCurrentLocation();
        }
    }, [id]);

    useEffect(() => {
        if (formData.geo_lat && formData.geo_lng) {
            const lat = parseFloat(formData.geo_lat);
            const lng = parseFloat(formData.geo_lng);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMapCenter({ lat, lng });
                setMarkerPosition({ lat, lng });
            }
        }
    }, [formData.geo_lat, formData.geo_lng]);

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
            toast.error('Error al cargar la lista de pacientes');
        }
    };

    const fetchDireccion = async () => {
        try {
            const response = await api.get(`/direcciones/${id}`);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Error al cargar dirección:', error);
            toast.error('Error al cargar la dirección');
        }
    };

    const getCurrentLocation = () => {
        if ('geolocation' in navigator) {
            setLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        geo_lat: latitude.toFixed(6),
                        geo_lng: longitude.toFixed(6)
                    }));
                    setMapCenter({ lat: latitude, lng: longitude });
                    setMarkerPosition({ lat: latitude, lng: longitude });
                    toast.success('Ubicación actual obtenida');
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error('Error al obtener ubicación:', error);
                    toast.warning('No se pudo obtener tu ubicación actual');
                    setLoadingLocation(false);
                }
            );
        } else {
            toast.warning('Tu navegador no soporta geolocalización');
        }
    };

    const handleMapClick = (e) => {
        // Simular click en el mapa (en una implementación real con Leaflet)
        // Por ahora, permitir ingresar coordenadas manualmente
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleAliasPreset = (value) => {
        setFormData(prev => ({
            ...prev,
            alias: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (isEdit) {
                await api.put(`/direcciones/${id}`, formData);
                toast.success('Dirección actualizada exitosamente');
            } else {
                await api.post('/direcciones', formData);
                toast.success('Dirección registrada exitosamente');
            }
            navigate('/direcciones');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                toast.error('Por favor corrige los errores en el formulario');
            } else {
                toast.error('Error al guardar la dirección');
            }
        } finally {
            setLoading(false);
        }
    };

    const clearCoordinates = () => {
        setFormData(prev => ({
            ...prev,
            geo_lat: '',
            geo_lng: ''
        }));
        setMarkerPosition(null);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {isEdit ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {isEdit ? 'Modifica los datos de la dirección' : 'Registra una nueva dirección con ubicación en el mapa'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario */}
                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Paciente */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Paciente <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="id_paciente"
                                    value={formData.id_paciente}
                                    onChange={handleChange}
                                    className="input-field"
                                    disabled={isEdit}
                                    required
                                >
                                    <option value="">Seleccione un paciente</option>
                                    {pacientes.map(paciente => (
                                        <option key={paciente.id_paciente} value={paciente.id_paciente}>
                                            {paciente.nombre} {paciente.apellido}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_paciente && (
                                    <p className="text-red-500 text-xs mt-1">{errors.id_paciente[0]}</p>
                                )}
                            </div>

                            {/* Alias con Presets */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Alias <span className="text-red-500">*</span>
                                </label>
                                
                                {/* Botones de Alias Rápido */}
                                <div className="flex gap-2 mb-2">
                                    {aliasPresets.map((preset) => {
                                        const Icon = preset.icon;
                                        return (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => handleAliasPreset(preset.label)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                                    formData.alias.toLowerCase() === preset.value
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{preset.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <input
                                    type="text"
                                    name="alias"
                                    value={formData.alias}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: Casa, Oficina, Casa de Playa"
                                    maxLength="50"
                                    required
                                />
                                {errors.alias && (
                                    <p className="text-red-500 text-xs mt-1">{errors.alias[0]}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Dirección Completa <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: Av. Siempre Viva 123, Depto. 4B, Capital Federal"
                                    rows="3"
                                    required
                                />
                                {errors.descripcion && (
                                    <p className="text-red-500 text-xs mt-1">{errors.descripcion[0]}</p>
                                )}
                            </div>

                            {/* Coordenadas GPS */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Ubicación GPS
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            disabled={loadingLocation}
                                            className="text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {loadingLocation ? (
                                                <>
                                                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-primary-600 border-t-transparent"></div>
                                                    Obteniendo...
                                                </>
                                            ) : (
                                                <>
                                                    <Navigation className="w-3 h-3" />
                                                    Mi Ubicación
                                                </>
                                            )}
                                        </button>
                                        {(formData.geo_lat || formData.geo_lng) && (
                                            <button
                                                type="button"
                                                onClick={clearCoordinates}
                                                className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" />
                                                Limpiar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <input
                                            type="number"
                                            name="geo_lat"
                                            value={formData.geo_lat}
                                            onChange={handleChange}
                                            className="input-field text-sm"
                                            placeholder="Latitud"
                                            step="0.000001"
                                            min="-90"
                                            max="90"
                                        />
                                        {errors.geo_lat && (
                                            <p className="text-red-500 text-xs mt-1">{errors.geo_lat[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <input
                                            type="number"
                                            name="geo_lng"
                                            value={formData.geo_lng}
                                            onChange={handleChange}
                                            className="input-field text-sm"
                                            placeholder="Longitud"
                                            step="0.000001"
                                            min="-180"
                                            max="180"
                                        />
                                        {errors.geo_lng && (
                                            <p className="text-red-500 text-xs mt-1">{errors.geo_lng[0]}</p>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    💡 Usa el botón "Mi Ubicación" o ingresa las coordenadas manualmente
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/direcciones')}
                                    className="btn-secondary flex-1"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Guardando...
                                        </div>
                                    ) : (
                                        isEdit ? 'Actualizar Dirección' : 'Guardar Dirección'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Mapa */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                Vista del Mapa
                            </h3>
                            {markerPosition && (
                                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                    ✓ Ubicación marcada
                                </span>
                            )}
                        </div>

                        {/* Mapa con OpenStreetMap */}
                        <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                            {markerPosition ? (
                                <iframe
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${markerPosition.lng-0.01},${markerPosition.lat-0.01},${markerPosition.lng+0.01},${markerPosition.lat+0.01}&layer=mapnik&marker=${markerPosition.lat},${markerPosition.lng}`}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    title="Mapa de ubicación"
                                ></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-center px-4">
                                        Ingresa las coordenadas o usa "Mi Ubicación" para ver el mapa
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Información adicional */}
                        {markerPosition && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                                    📍 Coordenadas actuales:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Latitud:</span>
                                        <span className="ml-2 font-mono">{markerPosition.lat.toFixed(6)}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Longitud:</span>
                                        <span className="ml-2 font-mono">{markerPosition.lng.toFixed(6)}</span>
                                    </div>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                                >
                                    Ver en Google Maps →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DireccionesFormMejorado;
