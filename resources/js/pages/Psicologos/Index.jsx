import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Brain, Plus, Search, Edit, Trash2, Phone, Mail, Eye } from 'lucide-react';
import api from '../../config/api';

const PsicologosIndex = () => {
    const [psicologos, setPsicologos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState('todos');
    const [pagination, setPagination] = useState({});
    const toast = useToast();
    const confirm = useConfirm();

    const fetchPsicologos = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                search: search || undefined,
                estado: estado !== 'todos' ? estado : undefined
            };
            
            const response = await api.get('/psicologos', { params });
            setPsicologos(response.data.data || []);
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Error al cargar psicólogos:', error);
            toast.error('❌ Error al cargar psicólogos');
            setPsicologos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPsicologos();
    }, [search, estado]);

    const handleDelete = async (id, nombre) => {
        const confirmed = await confirm({
            title: 'Eliminar Psicólogo',
            message: `¿Estás seguro de que deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/psicologos/${id}`);
            toast.success('✅ Psicólogo eliminado exitosamente');
            fetchPsicologos();
        } catch (error) {
            console.error('Error al eliminar psicólogo:', error);
            toast.error('❌ Error al eliminar psicólogo');
        }
    };

    const getEstadoBadge = (estado) => {
        return estado === 'ACTIVO' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Psicólogos</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los psicólogos del sistema</p>
                        </div>
                    </div>
                    <Link
                        to="/psicologos/nuevo"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Psicólogo
                    </Link>
                </div>

                {/* Filtros */}
                <div className="card">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o cédula..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input pl-10"
                                />
                            </div>
                        </div>
                        
                        {/* Filtro por estado */}
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="input md:w-48"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="ACTIVO">Activos</option>
                            <option value="INACTIVO">Inactivos</option>
                        </select>
                    </div>
                </div>

                {/* Lista de Psicólogos */}
                {loading ? (
                    <div className="card text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando psicólogos...</p>
                    </div>
                ) : !psicologos || psicologos.length === 0 ? (
                    <div className="card text-center py-16">
                        <Brain className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No hay psicólogos</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {search || estado !== 'todos' 
                                ? 'No se encontraron psicólogos con los filtros aplicados'
                                : 'Aún no hay psicólogos registrados en el sistema'
                            }
                        </p>
                        <Link to="/psicologos/nuevo" className="btn-primary">
                            <Plus className="w-5 h-5 mr-2" />
                            Crear Primer Psicólogo
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {psicologos.map((psicologo) => (
                            <div key={psicologo.id_psicologo} className="card hover:shadow-lg transition-shadow">
                                {/* Header de la tarjeta */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100">
                                                {psicologo.nombre} {psicologo.apellido}
                                            </h3>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(psicologo.estado)}`}>
                                                {psicologo.estado}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Información */}
                                <div className="space-y-2 mb-4">
                                    {psicologo.especialidad && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Especialidad:</strong> {psicologo.especialidad}
                                        </p>
                                    )}
                                    {psicologo.cedula_profesional && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Cédula:</strong> {psicologo.cedula_profesional}
                                        </p>
                                    )}
                                    {psicologo.telefono && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone className="w-4 h-4" />
                                            {psicologo.telefono}
                                        </div>
                                    )}
                                    {psicologo.user?.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Mail className="w-4 h-4" />
                                            {psicologo.user.email}
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <Link
                                        to={`/psicologos/${psicologo.id_psicologo}`}
                                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver
                                    </Link>
                                    <Link
                                        to={`/psicologos/${psicologo.id_psicologo}/editar`}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(psicologo.id_psicologo, `${psicologo.nombre} ${psicologo.apellido}`)}
                                        className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {pagination.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => fetchPsicologos(page)}
                                className={`px-3 py-2 rounded-lg ${
                                    page === pagination.current_page
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PsicologosIndex;
