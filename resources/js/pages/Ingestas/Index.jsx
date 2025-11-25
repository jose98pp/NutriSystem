import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Plus, Calendar, Utensils, Flame, Activity, TrendingUp,
    Trash2, Clock, User, Apple, Beef, Wheat, Droplet
} from 'lucide-react';

const IngestasIndex = () => {
    const { user, isPaciente } = useAuth();
    const [ingestas, setIngestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [pacienteId, setPacienteId] = useState('');
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        // Establecer fecha por defecto: últimos 7 días
        const hoy = new Date();
        const hace7dias = new Date();
        hace7dias.setDate(hace7dias.getDate() - 7);
        
        setFechaFin(hoy.toISOString().split('T')[0]);
        setFechaInicio(hace7dias.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (fechaInicio && fechaFin) {
            fetchIngestas();
        }
    }, [fechaInicio, fechaFin, pacienteId]);

    const fetchIngestas = async () => {
        try {
            const params = {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            };
            if (pacienteId) params.paciente_id = pacienteId;

            const response = await api.get('/ingestas', { params });
            setIngestas(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar ingestas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Eliminar Ingesta',
            message: '¿Estás seguro de que deseas eliminar esta ingesta? Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/ingestas/${id}`);
            setIngestas(ingestas.filter(i => i.id_ingesta !== id));
            toast.success('Ingesta eliminada exitosamente');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar ingesta';
            toast.error(errorMessage);
        }
    };

    // Memoizar el cálculo de totales para evitar recálculos innecesarios
    const calcularTotales = useMemo(() => {
        return (ingesta) => {
            if (!ingesta.alimentos) return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

            return ingesta.alimentos.reduce((totales, alimento) => {
                const cantidad = alimento.pivot?.cantidad_gramos || 0;
                return {
                    calorias: totales.calorias + (alimento.calorias_por_100g * cantidad / 100),
                    proteinas: totales.proteinas + (alimento.proteinas_por_100g * cantidad / 100),
                    carbohidratos: totales.carbohidratos + (alimento.carbohidratos_por_100g * cantidad / 100),
                    grasas: totales.grasas + (alimento.grasas_por_100g * cantidad / 100),
                };
            }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
        };
    }, []);

    // Memoizar el agrupamiento por día
    const ingestasPorDia = useMemo(() => {
        return ingestas.reduce((grupos, ingesta) => {
            const fecha = new Date(ingesta.fecha_hora).toLocaleDateString('es-ES');
            if (!grupos[fecha]) {
                grupos[fecha] = [];
            }
            grupos[fecha].push(ingesta);
            return grupos;
        }, {});
    }, [ingestas]);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Utensils className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Registro de Ingestas</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Historial de comidas y nutrición</p>
                        {isPaciente() && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                💡 Tip: Usa <Link to="/mis-comidas-hoy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">Mis Comidas de Hoy</Link> para registro rápido
                            </p>
                        )}
                    </div>
                    <Link to="/ingestas/nueva" className="btn-primary flex items-center gap-2">
                        <Plus size={20} />
                        Registrar Ingesta
                    </Link>
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Calendar size={16} />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Calendar size={16} />
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        {!isPaciente() && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <User size={16} />
                                    ID Paciente
                                </label>
                                <input
                                    type="number"
                                    value={pacienteId}
                                    onChange={(e) => setPacienteId(e.target.value)}
                                    className="input-field"
                                    placeholder="Opcional..."
                                />
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : Object.keys(ingestasPorDia).length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron ingestas en este periodo</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(ingestasPorDia).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([fecha, ingestasDelDia]) => {
                                // Calcular totales del día
                                const totalesDia = ingestasDelDia.reduce((acc, ingesta) => {
                                    const totales = calcularTotales(ingesta);
                                    return {
                                        calorias: acc.calorias + totales.calorias,
                                        proteinas: acc.proteinas + totales.proteinas,
                                        carbohidratos: acc.carbohidratos + totales.carbohidratos,
                                        grasas: acc.grasas + totales.grasas,
                                    };
                                }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });

                                return (
                                    <div key={fecha} className="card-hover animate-fadeIn">
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{fecha}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                <span className="font-bold text-orange-700 dark:text-orange-300">{totalesDia.calorias.toFixed(0)} kcal</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {ingestasDelDia.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)).map((ingesta) => {
                                                const totales = calcularTotales(ingesta);
                                                return (
                                                    <div key={ingesta.id_ingesta} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                                                                    <Clock className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-800 dark:text-gray-100">
                                                                        {new Date(ingesta.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                        <User size={14} />
                                                                        {ingesta.paciente?.nombre} {ingesta.paciente?.apellido}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(ingesta.id_ingesta)}
                                                                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Eliminar ingesta"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>

                                                        {ingesta.alimentos && ingesta.alimentos.length > 0 && (
                                                            <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                                {ingesta.alimentos.map((alimento) => (
                                                                    <div key={alimento.id_alimento} className="flex justify-between items-center text-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <Apple size={14} className="text-gray-400" />
                                                                            <span className="text-gray-700 dark:text-gray-300">{alimento.nombre}</span>
                                                                        </div>
                                                                        <span className="font-medium text-gray-600 dark:text-gray-400">{alimento.pivot?.cantidad_gramos}g</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-4 gap-3">
                                                            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                                    <Flame size={14} className="text-orange-600 dark:text-orange-400" />
                                                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Calorías</p>
                                                                </div>
                                                                <p className="font-bold text-orange-700 dark:text-orange-300">{totales.calorias.toFixed(0)}</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                                    <Beef size={14} className="text-blue-600 dark:text-blue-400" />
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Proteínas</p>
                                                                </div>
                                                                <p className="font-bold text-blue-700 dark:text-blue-300">{totales.proteinas.toFixed(1)}g</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                                    <Wheat size={14} className="text-yellow-600 dark:text-yellow-400" />
                                                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Carbos</p>
                                                                </div>
                                                                <p className="font-bold text-yellow-700 dark:text-yellow-300">{totales.carbohidratos.toFixed(1)}g</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
                                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                                    <Droplet size={14} className="text-amber-600 dark:text-amber-400" />
                                                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Grasas</p>
                                                                </div>
                                                                <p className="font-bold text-amber-700 dark:text-amber-300">{totales.grasas.toFixed(1)}g</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Totales del día */}
                                        <div className="mt-4 p-5 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                <h4 className="font-bold text-primary-900 dark:text-primary-100">Totales del Día</h4>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center justify-center gap-1 mb-2">
                                                        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Calorías</p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{totalesDia.calorias.toFixed(0)}</p>
                                                    <p className="text-xs text-orange-600 dark:text-orange-400">kcal</p>
                                                </div>
                                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center justify-center gap-1 mb-2">
                                                        <Beef className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Proteínas</p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalesDia.proteinas.toFixed(1)}</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">gramos</p>
                                                </div>
                                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center justify-center gap-1 mb-2">
                                                        <Wheat className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Carbohidratos</p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{totalesDia.carbohidratos.toFixed(1)}</p>
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">gramos</p>
                                                </div>
                                                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <div className="flex items-center justify-center gap-1 mb-2">
                                                        <Droplet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Grasas</p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{totalesDia.grasas.toFixed(1)}</p>
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">gramos</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default IngestasIndex;
