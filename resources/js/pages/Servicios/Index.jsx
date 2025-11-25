import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Trash2, Edit, Plus, Search, Target, DollarSign, Clock, Package } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { logApiError } from '../../utils/logger';

const ServiciosIndex = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await api.get('/servicios');
            setServicios(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            logApiError('/servicios', error);
            toast.error('Error al cargar servicios');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const servicio = servicios.find(s => s.id_servicio === id);
        
        const confirmed = await confirm({
            title: 'Eliminar Servicio',
            message: `¿Estás seguro de que deseas eliminar el servicio "${servicio?.nombre}"?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/servicios/${id}`);
            toast.success('Servicio eliminado exitosamente');
            fetchServicios();
        } catch (error) {
            logApiError(`/servicios/${id}`, error);
            toast.error('Error al eliminar el servicio');
        }
    };

    const filteredServicios = servicios.filter(servicio => {
        const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            servicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filterTipo === '' || servicio.tipo_servicio === filterTipo;
        return matchesSearch && matchesTipo;
    });

    const getTipoLabel = (tipo) => {
        const tipos = {
            'plan_alimenticio': 'Plan Alimenticio',
            'asesoramiento': 'Asesoramiento',
            'catering': 'Catering'
        };
        return tipos[tipo] || tipo;
    };

    const getTipoBadgeClass = (tipo) => {
        const classes = {
            'plan_alimenticio': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
            'asesoramiento': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
            'catering': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
        };
        return classes[tipo] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Servicios</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los servicios ofrecidos</p>
                    </div>
                    <Link
                        to="/servicios/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Servicio
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Servicios</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{servicios.length}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <Package className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Planes Alimenticios</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {servicios.filter(s => s.tipo_servicio === 'plan_alimenticio').length}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <Target className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Asesoramientos</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    {servicios.filter(s => s.tipo_servicio === 'asesoramiento').length}
                                </p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                                <Clock className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Costo Promedio</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    ${servicios.length > 0 
                                        ? (servicios.reduce((sum, s) => sum + parseFloat(s.costo || 0), 0) / servicios.length).toFixed(0)
                                        : 0
                                    }
                                </p>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                                <DollarSign className="text-orange-600 dark:text-orange-400" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar servicios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="plan_alimenticio">Plan Alimenticio</option>
                            <option value="asesoramiento">Asesoramiento</option>
                            <option value="catering">Catering</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando servicios...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Servicio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Duración
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Costo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredServicios.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron servicios
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredServicios.map((servicio) => (
                                            <tr key={servicio.id_servicio} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                            <Package className="text-white" size={20} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {servicio.nombre}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoBadgeClass(servicio.tipo_servicio)}`}>
                                                        {getTipoLabel(servicio.tipo_servicio)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <Clock size={14} className="text-gray-400" />
                                                        {servicio.duracion_dias} días
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        <DollarSign size={14} className="text-green-500" />
                                                        {parseFloat(servicio.costo).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                    {servicio.descripcion || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/servicios/${servicio.id_servicio}/editar`}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(servicio.id_servicio)}
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
                {!loading && servicios.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {filteredServicios.length} de {servicios.length} servicios
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ServiciosIndex;
