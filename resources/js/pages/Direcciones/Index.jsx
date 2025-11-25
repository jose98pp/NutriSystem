import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const DireccionesIndex = () => {
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pacientes, setPacientes] = useState([]);
    const [selectedPaciente, setSelectedPaciente] = useState('');

    useEffect(() => {
        fetchDirecciones();
        fetchPacientes();
    }, [selectedPaciente]);

    const fetchDirecciones = async () => {
        try {
            const params = selectedPaciente ? { id_paciente: selectedPaciente } : {};
            const response = await api.get('/direcciones', { params });
            setDirecciones(response.data.data);
        } catch (error) {
            console.error('Error al cargar direcciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data);
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta dirección?')) {
            try {
                await api.delete(`/direcciones/${id}`);
                fetchDirecciones();
            } catch (error) {
                console.error('Error al eliminar dirección:', error);
                alert('Error al eliminar la dirección');
            }
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Direcciones</h2>
                        <p className="text-gray-600 mt-1">Gestión de direcciones de pacientes</p>
                    </div>
                    <Link to="/direcciones/nuevo" className="btn-primary">
                        + Nueva Dirección
                    </Link>
                </div>

                <div className="card">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filtrar por Paciente
                        </label>
                        <select
                            value={selectedPaciente}
                            onChange={(e) => setSelectedPaciente(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Todos los pacientes</option>
                            {pacientes.map(paciente => (
                                <option key={paciente.id_paciente} value={paciente.id_paciente}>
                                    {paciente.nombre} {paciente.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : direcciones.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No hay direcciones registradas</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {direcciones.map((direccion) => (
                                <div key={direccion.id_direccion} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{direccion.alias}</h3>
                                            {direccion.paciente && (
                                                <p className="text-sm text-gray-600">
                                                    {direccion.paciente.nombre} {direccion.paciente.apellido}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            📍
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Dirección:</span>
                                            <p className="font-medium mt-1">{direccion.descripcion}</p>
                                        </div>

                                        {(direccion.geo_lat && direccion.geo_lng) && (
                                            <div>
                                                <span className="text-gray-600">Coordenadas:</span>
                                                <p className="font-medium text-xs mt-1">
                                                    {direccion.geo_lat}, {direccion.geo_lng}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/direcciones/${direccion.id_direccion}/editar`}
                                            className="flex-1 text-center btn-secondary text-sm"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(direccion.id_direccion)}
                                            className="flex-1 text-center btn-danger text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DireccionesIndex;
