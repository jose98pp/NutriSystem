import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../config/api';
import { logApiError } from '../../utils/logger';
import { Trash2, Edit, Plus, Search, Mail, Phone, Users, Weight, Activity, UserCheck, Eye } from 'lucide-react';

const PacientesIndex = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchPacientes();
    }, []);

    const fetchPacientes = async () => {
        try {
            const response = await api.get('/pacientes');
            setPacientes(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            logApiError('/pacientes', error);
            toast.error('Error al cargar pacientes');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const paciente = pacientes.find(p => p.id_paciente === id);
        const nombreCompleto = `${paciente?.nombre} ${paciente?.apellido}`;
        
        const confirmed = await confirm({
            title: 'Eliminar Paciente',
            message: `¿Estás seguro de que deseas eliminar al paciente "${nombreCompleto}"? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/pacientes/${id}`);
            toast.success('Paciente eliminado exitosamente');
            fetchPacientes();
        } catch (error) {
            logApiError(`/pacientes/${id}`, error);
            toast.error('Error al eliminar el paciente');
        }
    };

    const calcularIMC = (peso, estatura) => {
        if (!peso || !estatura) return null;
        return (peso / (estatura ** 2)).toFixed(1);
    };

    const getIMCCategoria = (imc) => {
        if (!imc) return { label: 'N/A', color: 'gray' };
        const imcNum = parseFloat(imc);
        if (imcNum < 18.5) return { label: 'Bajo Peso', color: 'blue' };
        if (imcNum < 25) return { label: 'Normal', color: 'green' };
        if (imcNum < 30) return { label: 'Sobrepeso', color: 'yellow' };
        return { label: 'Obesidad', color: 'red' };
    };

    const filteredPacientes = pacientes.filter(paciente => {
        const searchLower = searchTerm.toLowerCase();
        return (
            paciente.nombre?.toLowerCase().includes(searchLower) ||
            paciente.apellido?.toLowerCase().includes(searchLower) ||
            paciente.email?.toLowerCase().includes(searchLower) ||
            paciente.telefono?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Pacientes</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los pacientes del sistema</p>
                    </div>
                    <Link
                        to="/pacientes/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Paciente
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pacientes</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{pacientes.length}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Peso Promedio</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {pacientes.length > 0 
                                        ? (pacientes.reduce((sum, p) => sum + (p.peso_inicial || 0), 0) / pacientes.length).toFixed(1)
                                        : 0
                                    } kg
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <Weight className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Con Nutricionista</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {pacientes.filter(p => p.id_nutricionista).length}
                                </p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                                <UserCheck className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando pacientes...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Paciente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Datos Físicos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Nutricionista
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredPacientes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron pacientes
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPacientes.map((paciente) => {
                                            const imc = calcularIMC(paciente.peso_inicial, paciente.estatura);
                                            const imcCategoria = getIMCCategoria(imc);
                                            
                                            return (
                                                <tr key={paciente.id_paciente} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white font-bold text-lg">
                                                                    {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {paciente.nombre} {paciente.apellido}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {paciente.genero}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                                            <Mail size={14} className="text-gray-400" />
                                                            {paciente.email}
                                                        </div>
                                                        {paciente.telefono && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                                <Phone size={14} className="text-gray-400" />
                                                                {paciente.telefono}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                                            <Weight size={14} className="text-gray-400" />
                                                            {paciente.peso_inicial || 'N/A'} kg
                                                        </div>
                                                        {imc && (
                                                            <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${imcCategoria.color}-100 dark:bg-${imcCategoria.color}-900/30 text-${imcCategoria.color}-800 dark:text-${imcCategoria.color}-400`}>
                                                                IMC: {imc} - {imcCategoria.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {paciente.nutricionista ? (
                                                            <div className="flex items-center gap-1">
                                                                <UserCheck size={16} className="text-green-500" />
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                    {paciente.nutricionista.nombre}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">Sin asignar</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                to={`/pacientes/${paciente.id_paciente}`}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                                                title="Ver Detalles"
                                                            >
                                                                <Eye size={18} />
                                                            </Link>
                                                            <Link
                                                                to={`/pacientes/${paciente.id_paciente}/editar`}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(paciente.id_paciente)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats */}
                {!loading && pacientes.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {filteredPacientes.length} de {pacientes.length} pacientes
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PacientesIndex;