import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const CalendariosEntregaForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        id_contrato: '',
        fecha_inicio: '',
        fecha_fin: '',
    });

    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [duracionDias, setDuracionDias] = useState(0);

    useEffect(() => {
        fetchContratos();
        if (isEdit) {
            fetchCalendario();
        }
    }, [id]);

    useEffect(() => {
        calcularDuracion();
    }, [formData.fecha_inicio, formData.fecha_fin]);

    const fetchContratos = async () => {
        try {
            const response = await api.get('/contratos');
            // Filtrar contratos activos que no tengan calendario
            const contratosDisponibles = response.data.data.filter(c => c.estado === 'ACTIVO');
            setContratos(contratosDisponibles);
        } catch (error) {
            console.error('Error al cargar contratos:', error);
        }
    };

    const fetchCalendario = async () => {
        try {
            const response = await api.get(`/calendarios-entrega/${id}`);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Error al cargar calendario:', error);
            alert('Error al cargar el calendario');
        }
    };

    const calcularDuracion = () => {
        if (formData.fecha_inicio && formData.fecha_fin) {
            const inicio = new Date(formData.fecha_inicio);
            const fin = new Date(formData.fecha_fin);
            const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
            setDuracionDias(diff > 0 ? diff : 0);
        } else {
            setDuracionDias(0);
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
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (isEdit) {
                await api.put(`/calendarios-entrega/${id}`, formData);
            } else {
                await api.post('/calendarios-entrega', formData);
            }
            navigate('/calendarios-entrega');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Error al guardar el calendario');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isEdit ? 'Editar Calendario de Entrega' : 'Nuevo Calendario de Entrega'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? 'Modifica el calendario' : 'Crea un calendario para programar entregas'}
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Contrato */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contrato <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="id_contrato"
                                value={formData.id_contrato}
                                onChange={handleChange}
                                className="input-field"
                                disabled={isEdit}
                                required
                            >
                                <option value="">Seleccione un contrato</option>
                                {contratos.map(contrato => (
                                    <option key={contrato.id_contrato} value={contrato.id_contrato}>
                                        Contrato #{contrato.id_contrato} - {contrato.paciente?.nombre} {contrato.paciente?.apellido} - {contrato.servicio?.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.id_contrato && (
                                <p className="text-red-500 text-xs mt-1">{errors.id_contrato[0]}</p>
                            )}
                            {!isEdit && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Solo se muestran contratos activos sin calendario asignado
                                </p>
                            )}
                        </div>

                        {/* Fecha Inicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Inicio <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                            {errors.fecha_inicio && (
                                <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio[0]}</p>
                            )}
                        </div>

                        {/* Fecha Fin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Fin <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={handleChange}
                                className="input-field"
                                min={formData.fecha_inicio}
                                required
                            />
                            {errors.fecha_fin && (
                                <p className="text-red-500 text-xs mt-1">{errors.fecha_fin[0]}</p>
                            )}
                        </div>

                        {/* Información de duración */}
                        {duracionDias > 0 && (
                            <div className="bg-blue-50 p-4 rounded">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📅</span>
                                    <div>
                                        <p className="font-medium text-blue-900">Duración del calendario</p>
                                        <p className="text-sm text-blue-700">
                                            {duracionDias} día{duracionDias !== 1 ? 's' : ''} de servicio
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Se generarán {duracionDias} entregas automáticamente (una por día)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
                            💡 Tip: Después de crear el calendario, podrás generar entregas automáticamente para todos los días
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/calendarios-entrega')}
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
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Calendario')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CalendariosEntregaForm;
