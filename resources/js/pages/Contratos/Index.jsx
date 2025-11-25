import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { Eye, Edit, Plus, Search, Calendar, DollarSign, FileText, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/ConfirmDialog';
import { logApiError } from '../../utils/logger';

const ContratosIndex = () => {
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const toast = useToast();
    const { user } = useAuth();
    const { confirm } = useConfirm();

    useEffect(() => {
        fetchContratos();
    }, []);

    const fetchContratos = async () => {
        try {
            const response = await api.get('/contratos');
            const data = response.data.data || response.data;
            setContratos(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            logApiError('/contratos', error);
            toast.error('Error al cargar contratos');
            setContratos([]);
            setLoading(false);
        }
    };

    const handleCancelar = async (id) => {
        const contrato = contratos.find(c => c.id_contrato === id);
        const pacienteNombre = contrato?.paciente?.nombre || 'Paciente';
        const servicioNombre = contrato?.servicio?.nombre || 'Servicio';
        
        const confirmed = await confirm({
            title: 'Cancelar Contrato',
            message: `¿Estás seguro de que deseas cancelar el contrato de "${servicioNombre}" para ${pacienteNombre}? Esta acción cancelará también los planes de alimentación y entregas asociadas.`,
            confirmText: 'Sí, cancelar contrato',
            cancelText: 'No cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await api.put(`/contratos/${id}/cancelar`);
            toast.success(response.data.message || 'Contrato cancelado exitosamente');
            
            // Mostrar detalles de la cancelación si están disponibles
            if (response.data.detalles_cancelacion) {
                const detalles = response.data.detalles_cancelacion;
                if (detalles.planes_cancelados > 0) {
                    toast.info(`${detalles.planes_cancelados} plan(es) de alimentación cancelado(s)`);
                }
            }
            
            fetchContratos();
        } catch (error) {
            logApiError(`/contratos/${id}/cancelar`, error);
            toast.error(error.response?.data?.message || 'Error al cancelar el contrato');
        }
    };

    const filteredContratos = contratos.filter(contrato => {
        if (!searchTerm && !filterEstado) return true;
        
        const pacienteNombre = contrato.paciente?.nombre || '';
        const pacienteApellido = contrato.paciente?.apellido || '';
        const pacienteEmail = contrato.paciente?.email || '';
        const servicioNombre = contrato.servicio?.nombre || '';
        const servicioDescripcion = contrato.servicio?.descripcion || '';
        
        const searchLower = searchTerm.toLowerCase().trim();
        
        const matchesSearch = !searchTerm || (
            pacienteNombre.toLowerCase().includes(searchLower) ||
            pacienteApellido.toLowerCase().includes(searchLower) ||
            pacienteEmail.toLowerCase().includes(searchLower) ||
            servicioNombre.toLowerCase().includes(searchLower) ||
            servicioDescripcion.toLowerCase().includes(searchLower) ||
            `${pacienteNombre} ${pacienteApellido}`.toLowerCase().includes(searchLower)
        );
        
        const matchesEstado = !filterEstado || contrato.estado === filterEstado;
        
        return matchesSearch && matchesEstado;
    });

    const getEstadoBadgeClass = (estado) => {
        const classes = {
            'PENDIENTE': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
            'ACTIVO': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
            'FINALIZADO': 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400',
            'CANCELADO': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
        };
        return classes[estado] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    };

    const getEstadoIcon = (estado) => {
        const icons = {
            'PENDIENTE': Clock,
            'ACTIVO': CheckCircle,
            'FINALIZADO': FileText,
            'CANCELADO': XCircle
        };
        return icons[estado] || FileText;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Contratos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los contratos de servicios con pacientes</p>
                    </div>
                    <Link
                        to="/contratos/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Contrato
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {['PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO'].map(estado => {
                        const count = contratos.filter(c => c.estado === estado).length;
                        const IconComponent = getEstadoIcon(estado);
                        const colorMap = {
                            'PENDIENTE': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
                            'ACTIVO': { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
                            'FINALIZADO': { bg: 'bg-gray-100 dark:bg-gray-900/30', icon: 'text-gray-600 dark:text-gray-400' },
                            'CANCELADO': { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' }
                        };
                        const colors = colorMap[estado];
                        
                        return (
                            <div key={estado} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{estado}</p>
                                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{count}</p>
                                    </div>
                                    <div className={`${colors.bg} p-3 rounded-full`}>
                                        <IconComponent className={colors.icon} size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por paciente, email o servicio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Todos los estados</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="ACTIVO">Activo</option>
                            <option value="FINALIZADO">Finalizado</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                        {(searchTerm || filterEstado) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterEstado('');
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    {(searchTerm || filterEstado) && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Filtros activos:</span>
                            {searchTerm && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                    Búsqueda: "{searchTerm}"
                                </span>
                            )}
                            {filterEstado && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                    Estado: {filterEstado}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando contratos...</p>
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
                                            Servicio
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Fechas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Costo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredContratos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron contratos
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContratos.map((contrato) => (
                                            <tr key={contrato.id_contrato} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-lg">
                                                                {contrato.paciente?.nombre?.charAt(0)}{contrato.paciente?.apellido?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {contrato.paciente?.nombre} {contrato.paciente?.apellido}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {contrato.paciente?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        {contrato.servicio?.nombre}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {contrato.servicio?.duracion_dias} días
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        {formatDate(contrato.fecha_inicio)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        → {formatDate(contrato.fecha_fin)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        <DollarSign size={14} className="text-green-500" />
                                                        {parseFloat(contrato.costo_contratado).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(contrato.estado)}`}>
                                                        {contrato.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/contratos/${contrato.id_contrato}`}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        {(user?.role === 'admin' || user?.role === 'nutricionista') && contrato.estado !== 'CANCELADO' && (
                                                            <Link
                                                                to={`/contratos/${contrato.id_contrato}/editar`}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
                                                        )}
                                                        {(user?.role === 'admin' || user?.role === 'nutricionista') && contrato.estado === 'ACTIVO' && (
                                                            <button
                                                                onClick={() => handleCancelar(contrato.id_contrato)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                                title="Cancelar Contrato"
                                                            >
                                                                <Ban size={18} />
                                                            </button>
                                                        )}
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
                {!loading && (
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {contratos.length === 0 ? (
                                <span>No hay contratos registrados</span>
                            ) : (
                                <span>
                                    Mostrando <strong className="text-gray-800 dark:text-gray-100">{filteredContratos.length}</strong> de <strong className="text-gray-800 dark:text-gray-100">{contratos.length}</strong> contratos
                                    {(searchTerm || filterEstado) && filteredContratos.length < contratos.length && (
                                        <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                                            ({contratos.length - filteredContratos.length} ocultos por filtros)
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        {contratos.length > 0 && (
                            <Link
                                to="/contratos/nuevo"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                                + Agregar otro contrato
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ContratosIndex;
