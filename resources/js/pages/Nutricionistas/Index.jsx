import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Trash2, Edit, Plus, Search, Mail, Phone, Briefcase, Users, Eye } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { logApiError } from '../../utils/logger';

const NutricionistasIndex = () => {
    const [nutricionistas, setNutricionistas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const { confirm } = useConfirm();

    useEffect(() => {
        fetchNutricionistas();
    }, []);

    const fetchNutricionistas = async () => {
        try {
            const response = await api.get('/nutricionistas');
            setNutricionistas(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            logApiError('/nutricionistas', error);
            toast.error('Error al cargar nutricionistas');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const nutricionista = nutricionistas.find(n => n.id_nutricionista === id);
        const nombreCompleto = `${nutricionista?.nombre} ${nutricionista?.apellido}`;
        
        const confirmed = await confirm({
            title: 'Eliminar Nutricionista',
            message: `¿Estás seguro de que deseas eliminar al nutricionista "${nombreCompleto}"?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/nutricionistas/${id}`);
            toast.success('Nutricionista eliminado exitosamente');
            fetchNutricionistas();
        } catch (error) {
            logApiError(`/nutricionistas/${id}`, error);
            toast.error('Error al eliminar el nutricionista');
        }
    };

    const filteredNutricionistas = nutricionistas.filter(nutricionista => {
        const searchLower = searchTerm.toLowerCase();
        return (
            nutricionista.nombre?.toLowerCase().includes(searchLower) ||
            nutricionista.apellido?.toLowerCase().includes(searchLower) ||
            nutricionista.email?.toLowerCase().includes(searchLower) ||
            nutricionista.especialidad?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Nutricionistas</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona el equipo de nutricionistas</p>
                    </div>
                    <Link
                        to="/nutricionistas/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Nutricionista
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Nutricionistas</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{nutricionistas.length}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <Users className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pacientes Asignados</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {nutricionistas.reduce((sum, n) => sum + (n.pacientes_count || 0), 0)}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <Briefcase className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Especialidades</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {new Set(nutricionistas.map(n => n.especialidad).filter(Boolean)).size}
                                </p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                                <Briefcase className="text-purple-600 dark:text-purple-400" size={24} />
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
                            placeholder="Buscar por nombre, email o especialidad..."
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
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando nutricionistas...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Nutricionista
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Especialidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Pacientes
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredNutricionistas.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron nutricionistas
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredNutricionistas.map((nutricionista) => (
                                            <tr key={nutricionista.id_nutricionista} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-lg">
                                                                {nutricionista.nombre?.charAt(0)}{nutricionista.apellido?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {nutricionista.nombre} {nutricionista.apellido}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {nutricionista.email}
                                                    </div>
                                                    {nutricionista.telefono && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {nutricionista.telefono}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                                                        {nutricionista.especialidad || 'Sin especialidad'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Users size={16} className="text-gray-400" />
                                                        {nutricionista.pacientes_count || 0} pacientes
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/nutricionistas/${nutricionista.id_nutricionista}/pacientes`}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                                            title="Ver Pacientes"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <Link
                                                            to={`/nutricionistas/${nutricionista.id_nutricionista}/editar`}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(nutricionista.id_nutricionista)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats */}
                {!loading && nutricionistas.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {filteredNutricionistas.length} de {nutricionistas.length} nutricionistas
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NutricionistasIndex;
