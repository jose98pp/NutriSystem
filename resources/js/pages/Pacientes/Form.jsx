import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const PacienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        genero: 'M',
        email: '',
        telefono: '',
        peso_inicial: '',
        estatura: '',
        alergias: '',
        id_nutricionista: '',
        password: ''
    });
    const [nutricionistas, setNutricionistas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNutricionistas();
        if (isEdit) {
            fetchPaciente();
        }
    }, [id]);

    const fetchNutricionistas = async () => {
        try {
            const response = await api.get('/nutricionistas');
            setNutricionistas(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar nutricionistas:', error);
        }
    };

    const fetchPaciente = async () => {
        try {
            const response = await api.get(`/pacientes/${id}`);
            setFormData(response.data);
        } catch (error) {
            setError('Error al cargar paciente');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Preparar datos para enviar
            const dataToSend = { ...formData };
            
            // Si está editando, eliminar el campo password
            if (isEdit) {
                delete dataToSend.password;
                await api.put(`/pacientes/${id}`, dataToSend);
            } else {
                // Si password está vacío, no enviarlo (backend usará default)
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await api.post('/pacientes', dataToSend);
            }
            navigate('/pacientes');
        } catch (error) {
            setError(error.response?.data?.message || 'Error al guardar paciente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}
                    </h2>
                    <p className="text-gray-600 mt-1">Complete los datos del paciente</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Nacimiento *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Género *
                                </label>
                                <select
                                    name="genero"
                                    value={formData.genero}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {!isEdit && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Dejar vacío para usar: password123"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Si se deja vacío, se usará "password123" por defecto
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nutricionista Asignado
                                </label>
                                <select
                                    name="id_nutricionista"
                                    value={formData.id_nutricionista || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Sin asignar</option>
                                    {nutricionistas.map((nutri) => (
                                        <option key={nutri.id_nutricionista} value={nutri.id_nutricionista}>
                                            {nutri.nombre} {nutri.apellido} - {nutri.especialidad || 'General'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Peso Inicial (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="peso_inicial"
                                    value={formData.peso_inicial}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estatura (m)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="estatura"
                                    value={formData.estatura}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alergias / Restricciones Alimentarias
                            </label>
                            <textarea
                                name="alergias"
                                value={formData.alergias}
                                onChange={handleChange}
                                className="input-field"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Paciente')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/pacientes')}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default PacienteForm;
