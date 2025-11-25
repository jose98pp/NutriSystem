import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const DireccionesForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        id_paciente: '',
        alias: '',
        descripcion: '',
        geo_lat: '',
        geo_lng: '',
    });

    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchPacientes();
        if (isEdit) {
            fetchDireccion();
        }
    }, [id]);

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    };

    const fetchDireccion = async () => {
        try {
            const response = await api.get(`/direcciones/${id}`);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Error al cargar dirección:', error);
            alert('Error al cargar la dirección');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo
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
                await api.put(`/direcciones/${id}`, formData);
            } else {
                await api.post('/direcciones', formData);
            }
            navigate('/direcciones');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Error al guardar la dirección');
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
                        {isEdit ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? 'Modifica los datos de la dirección' : 'Registra una nueva dirección para el paciente'}
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Paciente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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

                        {/* Alias */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alias <span className="text-red-500">*</span>
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitud (opcional)
                                </label>
                                <input
                                    type="number"
                                    name="geo_lat"
                                    value={formData.geo_lat}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="-34.603722"
                                    step="0.000001"
                                    min="-90"
                                    max="90"
                                />
                                {errors.geo_lat && (
                                    <p className="text-red-500 text-xs mt-1">{errors.geo_lat[0]}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitud (opcional)
                                </label>
                                <input
                                    type="number"
                                    name="geo_lng"
                                    value={formData.geo_lng}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="-58.381592"
                                    step="0.000001"
                                    min="-180"
                                    max="180"
                                />
                                {errors.geo_lng && (
                                    <p className="text-red-500 text-xs mt-1">{errors.geo_lng[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                            💡 Tip: Las coordenadas GPS son opcionales pero ayudan a ubicar la dirección en mapas.
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
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default DireccionesForm;
