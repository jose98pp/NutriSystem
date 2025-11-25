import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Save, ArrowLeft, AlertTriangle } from 'lucide-react';

const ContratoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const isEdit = Boolean(id);

    // Verificar permisos - admin y nutricionista pueden crear/editar contratos
    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'nutricionista') {
            navigate('/contratos');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        id_paciente: '',
        id_servicio: '',
        fecha_inicio: '',
        fecha_fin: '',
        costo_contratado: '',
        estado: 'PENDIENTE',
        observaciones: ''
    });

    const [pacientes, setPacientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (isEdit && pacientes.length > 0 && servicios.length > 0) {
            fetchContrato();
        }
    }, [id, pacientes, servicios]);

    useEffect(() => {
        // Auto-calculate fecha_fin and costo when servicio or fecha_inicio changes
        if (formData.id_servicio && formData.fecha_inicio) {
            const servicio = servicios.find(s => s.id_servicio == formData.id_servicio);
            if (servicio) {
                setSelectedServicio(servicio);
                
                // Calculate fecha_fin
                const fechaInicio = new Date(formData.fecha_inicio);
                const fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaFin.getDate() + parseInt(servicio.duracion_dias));
                
                setFormData(prev => ({
                    ...prev,
                    fecha_fin: fechaFin.toISOString().split('T')[0],
                    costo_contratado: prev.costo_contratado || servicio.costo
                }));
            }
        }
    }, [formData.id_servicio, formData.fecha_inicio, servicios]);

    const fetchInitialData = async () => {
        try {
            const [pacientesRes, serviciosRes] = await Promise.all([
                api.get('/pacientes'),
                api.get('/servicios')
            ]);
            
            setPacientes(pacientesRes.data.data || pacientesRes.data);
            setServicios(serviciosRes.data.data || serviciosRes.data);
            setLoadingData(false);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar los datos necesarios');
            setLoadingData(false);
        }
    };

    const fetchContrato = async () => {
        try {
            const response = await api.get(`/contratos/${id}`);
            const contrato = response.data.data || response.data;
            setFormData({
                id_paciente: contrato.id_paciente || '',
                id_servicio: contrato.id_servicio || '',
                fecha_inicio: contrato.fecha_inicio || '',
                fecha_fin: contrato.fecha_fin || '',
                costo_contratado: contrato.costo_contratado || '',
                estado: contrato.estado || 'PENDIENTE',
                observaciones: contrato.observaciones || ''
            });
        } catch (error) {
            console.error('Error al cargar contrato:', error);
            alert('Error al cargar el contrato');
            navigate('/contratos');
        }
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
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.id_paciente) {
            newErrors.id_paciente = 'Selecciona un paciente';
        }

        if (!formData.id_servicio) {
            newErrors.id_servicio = 'Selecciona un servicio';
        }

        if (!formData.fecha_inicio) {
            newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
        }

        if (!formData.costo_contratado || formData.costo_contratado <= 0) {
            newErrors.costo_contratado = 'El costo debe ser mayor a 0';
        }

        if (formData.fecha_fin && formData.fecha_inicio) {
            if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
                newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/contratos/${id}`, formData);
            } else {
                await api.post('/contratos', formData);
            }
            navigate('/contratos');
        } catch (error) {
            console.error('Error al guardar contrato:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al guardar el contrato');
            }
            setLoading(false);
        }
    };

    // Verificar permisos antes de renderizar
    if (user && user.role !== 'admin' && user.role !== 'nutricionista') {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
                        <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
                            Acceso Denegado
                        </h2>
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            Solo los administradores y nutricionistas pueden crear o editar contratos.
                        </p>
                        <button
                            onClick={() => navigate('/contratos')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Volver a Contratos
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (loadingData) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/contratos')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver a Contratos
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {isEdit ? 'Editar Contrato' : 'Nuevo Contrato'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {isEdit ? 'Actualiza la información del contrato' : 'Completa los datos del nuevo contrato'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-6">
                        {/* Paciente y Servicio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Paciente <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <select
                                    name="id_paciente"
                                    value={formData.id_paciente}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                                        errors.id_paciente ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                >
                                    <option value="">Seleccionar paciente</option>
                                    {pacientes.map(paciente => (
                                        <option key={paciente.id_paciente} value={paciente.id_paciente}>
                                            {paciente.nombre} {paciente.apellido}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_paciente && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_paciente}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Servicio <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <select
                                    name="id_servicio"
                                    value={formData.id_servicio}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                                        errors.id_servicio ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                >
                                    <option value="">Seleccionar servicio</option>
                                    {servicios.map(servicio => (
                                        <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                            {servicio.nombre} - ${servicio.costo} ({servicio.duracion_dias} días)
                                        </option>
                                    ))}
                                </select>
                                {errors.id_servicio && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_servicio}</p>
                                )}
                            </div>
                        </div>

                        {/* Servicio Info */}
                        {selectedServicio && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Información del Servicio</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700 dark:text-blue-400 font-medium">Tipo:</span>
                                        <p className="text-blue-900 dark:text-blue-200">{selectedServicio.tipo_servicio}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 dark:text-blue-400 font-medium">Duración:</span>
                                        <p className="text-blue-900 dark:text-blue-200">{selectedServicio.duracion_dias} días</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 dark:text-blue-400 font-medium">Costo Base:</span>
                                        <p className="text-blue-900 dark:text-blue-200">${parseFloat(selectedServicio.costo).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fechas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fecha de Inicio <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                                        errors.fecha_inicio ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                />
                                {errors.fecha_inicio && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha_inicio}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fecha de Fin
                                </label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                                        errors.fecha_fin ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                />
                                {errors.fecha_fin && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha_fin}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Se calcula automáticamente según la duración del servicio
                                </p>
                            </div>
                        </div>

                        {/* Costo y Estado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Costo Contratado ($) <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="costo_contratado"
                                    value={formData.costo_contratado}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors ${
                                        errors.costo_contratado ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="150.00"
                                />
                                {errors.costo_contratado && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.costo_contratado}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estado <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                                >
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="ACTIVO">Activo</option>
                                    <option value="FINALIZADO">Finalizado</option>
                                    <option value="CANCELADO">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                                placeholder="Notas adicionales sobre el contrato..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => navigate('/contratos')}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {isEdit ? 'Actualizar' : 'Guardar'} Contrato
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ContratoForm;
