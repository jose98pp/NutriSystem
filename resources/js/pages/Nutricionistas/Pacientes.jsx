import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { ArrowLeft, UserPlus, Edit, Mail, Phone, Calendar, Weight, Ruler } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { logApiError } from '../../utils/logger';

const NutricionistaPacientes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [nutricionista, setNutricionista] = useState(null);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Obtener datos del nutricionista
            const nutricionistaResponse = await api.get(`/nutricionistas/${id}`);
            setNutricionista(nutricionistaResponse.data.data || nutricionistaResponse.data);

            // Obtener pacientes del nutricionista
            const pacientesResponse = await api.get('/pacientes', {
                params: { nutricionista_id: id }
            });
            setPacientes(pacientesResponse.data.data || pacientesResponse.data);
            setLoading(false);
        } catch (error) {
            logApiError(`/nutricionistas/${id}`, error);
            toast.error('Error al cargar datos del nutricionista');
            setLoading(false);
        }
    };

    const filteredPacientes = pacientes.filter(paciente => {
        const searchLower = searchTerm.toLowerCase();
        return (
            paciente.nombre?.toLowerCase().includes(searchLower) ||
            paciente.apellido?.toLowerCase().includes(searchLower) ||
            paciente.email?.toLowerCase().includes(searchLower)
        );
    });

    const calcularIMC = (peso, estatura) => {
        if (!peso || !estatura) return 'N/A';
        return (peso / (estatura ** 2)).toFixed(2);
    };

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/nutricionistas')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver a Nutricionistas
                    </button>

                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Pacientes de {nutricionista?.nombre} {nutricionista?.apellido}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {nutricionista?.especialidad && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                        {nutricionista.especialidad}
                                    </span>
                                )}
                            </p>
                        </div>
                        <Link
                            to="/pacientes/nuevo"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <UserPlus size={20} />
                            Asignar Nuevo Paciente
                        </Link>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Pacientes</p>
                                <p className="text-3xl font-bold text-gray-800">{pacientes.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <UserPlus className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Masculino</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {pacientes.filter(p => p.genero === 'M').length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <span className="text-2xl">👨</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Femenino</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {pacientes.filter(p => p.genero === 'F').length}
                                </p>
                            </div>
                            <div className="bg-pink-100 p-3 rounded-full">
                                <span className="text-2xl">👩</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Edad Promedio</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {pacientes.length > 0
                                        ? Math.round(
                                              pacientes.reduce((sum, p) => sum + calcularEdad(p.fecha_nacimiento), 0) /
                                                  pacientes.length
                                          )
                                        : 0}{' '}
                                    años
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Calendar className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar paciente por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Pacientes Grid */}
                {filteredPacientes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg">
                            {searchTerm
                                ? 'No se encontraron pacientes con ese criterio'
                                : 'Este nutricionista aún no tiene pacientes asignados'}
                        </p>
                        <Link
                            to="/pacientes/nuevo"
                            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                            <UserPlus size={20} />
                            Asignar primer paciente
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPacientes.map((paciente) => (
                            <div
                                key={paciente.id_paciente}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-lg">
                                                {paciente.nombre?.charAt(0)}
                                                {paciente.apellido?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">
                                                {paciente.nombre} {paciente.apellido}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {calcularEdad(paciente.fecha_nacimiento)} años - {paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Femenino' : 'Otro'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={14} />
                                        <span className="truncate">{paciente.email}</span>
                                    </div>
                                    {paciente.telefono && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone size={14} />
                                            <span>{paciente.telefono}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Weight size={14} />
                                        <span>Peso: {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Ruler size={14} />
                                        <span>Estatura: {paciente.estatura ? `${paciente.estatura} m` : 'N/A'}</span>
                                    </div>
                                    {paciente.peso_inicial && paciente.estatura && (
                                        <div className="pt-2 border-t">
                                            <span className="text-xs text-gray-500">IMC: </span>
                                            <span className="font-bold text-gray-800">
                                                {calcularIMC(paciente.peso_inicial, paciente.estatura)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {paciente.alergias && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-red-600">
                                            ⚠️ Alergias: {paciente.alergias}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t">
                                    <Link
                                        to={`/pacientes/${paciente.id_paciente}/editar`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit size={16} />
                                        Editar Paciente
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Stats */}
                {filteredPacientes.length > 0 && (
                    <div className="mt-6 text-sm text-gray-600 text-center">
                        Mostrando {filteredPacientes.length} de {pacientes.length} pacientes
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NutricionistaPacientes;
