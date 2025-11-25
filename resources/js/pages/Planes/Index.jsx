import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Edit, Power, PowerOff, Eye, Trash2 } from 'lucide-react';

const PlanesIndex = () => {
    const { isPaciente } = useAuth();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [soloActivos, setSoloActivos] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPlanes();
        }, 500); // Debounce de 500ms para la búsqueda

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, soloActivos]);

    const fetchPlanes = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (soloActivos) params.activo = 1;

            const response = await api.get('/planes', { params });
            setPlanes(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar planes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const plan = planes.find(p => p.id_plan === id);
        
        const confirmed = await confirm({
            title: 'Eliminar Plan',
            message: `¿Estás seguro de que deseas eliminar el plan "${plan?.nombre}"?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/planes/${id}`);
            toast.success('Plan eliminado exitosamente');
            fetchPlanes();
        } catch (error) {
            console.error('Error al eliminar plan:', error);
            toast.error('Error al eliminar el plan');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const plan = planes.find(p => p.id_plan === id);
        const action = currentStatus ? 'desactivar' : 'activar';
        
        const confirmed = await confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Plan`,
            message: `¿Estás seguro de que deseas ${action} el plan "${plan?.nombre}"?`,
            confirmText: `Sí, ${action}`,
            cancelText: 'Cancelar',
            type: currentStatus ? 'warning' : 'success'
        });

        if (!confirmed) return;

        try {
            await api.patch(`/planes/${id}/toggle-status`, {
                activo: !currentStatus
            });
            toast.success(`Plan ${currentStatus ? 'desactivado' : 'activado'} exitosamente`);
            fetchPlanes();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.error(`Error al ${action} el plan`);
        }
    };

    const isActivo = (plan) => {
        const hoy = new Date();
        const inicio = new Date(plan.fecha_inicio);
        const fin = new Date(plan.fecha_fin);
        return hoy >= inicio && hoy <= fin;
    };

    const getDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-3xl">📋</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Planes de Alimentación</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión de planes nutricionales</p>
                    </div>
                    {!isPaciente() && (
                        <Link to="/planes/nuevo" className="btn-primary">
                            + Crear Plan
                        </Link>
                    )}
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                🔍 Buscar Paciente
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field w-full"
                                placeholder="Buscar por nombre, apellido, correo o celular..."
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ejemplo: Juan, García, juan@email.com, 555-1234
                            </p>
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-2 cursor-pointer mb-3">
                                <input
                                    type="checkbox"
                                    checked={soloActivos}
                                    onChange={(e) => setSoloActivos(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Solo planes activos
                                </span>
                            </label>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : planes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron planes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {planes.map((plan) => (
                                <div key={plan.id_plan} className="card-hover animate-fadeIn">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                            {plan.paciente?.nombre?.charAt(0) || 'P'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">
                                                {plan.nombre || plan.nombre_plan}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {plan.paciente?.nombre} {plan.paciente?.apellido}
                                            </p>
                                        </div>
                                        {plan.activo ? (
                                            <span className="badge badge-success flex-shrink-0">Activo</span>
                                        ) : (
                                            <span className="badge badge-error flex-shrink-0">Inactivo</span>
                                        )}
                                    </div>

                                    {plan.descripcion && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {plan.descripcion}
                                        </p>
                                    )}

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Inicio:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {new Date(plan.fecha_inicio).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Fin:</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {new Date(plan.fecha_fin).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        {isActivo(plan) && (
                                            <>
                                                <div className="divider"></div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Progreso:</span>
                                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                                        {getDiasRestantes(plan.fecha_fin)} días restantes
                                                    </span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{ 
                                                            width: `${Math.max(0, Math.min(100, 100 - (getDiasRestantes(plan.fecha_fin) / 30 * 100)))}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Link
                                            to={`/planes/${plan.id_plan}`}
                                            className="w-full text-center btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16} />
                                            Ver Detalle
                                        </Link>
                                        {!isPaciente() && (
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/planes/${plan.id_plan}/editar`}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-600 dark:text-green-400 rounded-xl hover:shadow-md transition-all border border-green-200 dark:border-green-800 text-sm font-medium"
                                                    title="Editar plan"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleStatus(plan.id_plan, plan.activo)}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:shadow-md transition-all border text-sm font-medium ${
                                                        plan.activo 
                                                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                                            : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                    }`}
                                                    title={plan.activo ? 'Desactivar plan' : 'Activar plan'}
                                                >
                                                    {plan.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                                    {plan.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plan.id_plan)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400 rounded-xl hover:shadow-md transition-all text-sm font-medium border border-red-200 dark:border-red-800"
                                                    title="Eliminar plan"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
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

export default PlanesIndex;
