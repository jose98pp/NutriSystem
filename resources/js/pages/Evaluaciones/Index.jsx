import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { 
    Plus, Search, Activity, TrendingUp, TrendingDown, Scale, 
    Ruler, Heart, Eye, Trash2, Calendar, User, Stethoscope,
    AlertCircle, CheckCircle, Filter
} from 'lucide-react';

const EvaluacionesIndex = () => {
    const toast = useToast();
    const { confirm } = useConfirm();
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchNombre, setSearchNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);

    useEffect(() => {
        fetchEvaluaciones();
    }, [tipo]);

    useEffect(() => {
        filtrarPorNombre();
    }, [searchNombre, todasEvaluaciones]);

    const fetchEvaluaciones = async () => {
        try {
            const params = {};
            if (tipo) params.tipo = tipo;

            const response = await api.get('/evaluaciones', { params });
            const data = response.data.data || response.data;
            setTodasEvaluaciones(data);
            setEvaluaciones(data);
        } catch (error) {
            console.error('Error al cargar evaluaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarPorNombre = () => {
        if (!searchNombre.trim()) {
            setEvaluaciones(todasEvaluaciones);
            return;
        }

        const search = searchNombre.toLowerCase();
        const filtradas = todasEvaluaciones.filter(evaluacion => {
            const nombreCompleto = `${evaluacion.paciente?.nombre || ''} ${evaluacion.paciente?.apellido || ''}`.toLowerCase();
            const email = (evaluacion.paciente?.email || '').toLowerCase();
            
            return nombreCompleto.includes(search) || email.includes(search);
        });

        setEvaluaciones(filtradas);
    };

    const handleDelete = async (id) => {
        const evaluacion = evaluaciones.find(e => e.id_evaluacion === id);
        
        const confirmed = await confirm({
            title: 'Eliminar Evaluación',
            message: `¿Estás seguro de que deseas eliminar la evaluación de ${evaluacion?.paciente?.nombre}?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/evaluaciones/${id}`);
            toast.success('Evaluación eliminada exitosamente');
            setEvaluaciones(evaluaciones.filter(e => e.id_evaluacion !== id));
            setTodasEvaluaciones(todasEvaluaciones.filter(e => e.id_evaluacion !== id));
        } catch (error) {
            console.error('Error al eliminar evaluación:', error);
            toast.error('Error al eliminar la evaluación');
        }
    };

    const calcularIMC = (peso, altura) => {
        if (!peso || !altura) return 'N/A';
        return (peso / (altura ** 2)).toFixed(2);
    };

    const getClasificacionIMC = (imc) => {
        if (!imc || imc === 'N/A') return { texto: 'N/A', color: 'gray' };
        const imcNum = parseFloat(imc);
        if (imcNum < 18.5) return { texto: 'Bajo peso', color: 'blue' };
        if (imcNum < 25) return { texto: 'Normal', color: 'green' };
        if (imcNum < 30) return { texto: 'Sobrepeso', color: 'yellow' };
        return { texto: 'Obesidad', color: 'red' };
    };

    const getTipoBadgeColor = (tipoEval) => {
        const colores = {
            'INICIAL': 'bg-blue-100 text-blue-700',
            'PERIODICA': 'bg-yellow-100 text-yellow-700',
            'FINAL': 'bg-green-100 text-green-700'
        };
        return colores[tipoEval] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Evaluaciones</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Evaluaciones y mediciones antropométricas</p>
                    </div>
                    <Link to="/evaluaciones/nueva" className="btn-primary flex items-center gap-2">
                        <Plus size={20} />
                        Nueva Evaluación
                    </Link>
                </div>

                <div className="card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Search size={16} />
                                Buscar Paciente
                            </label>
                            <input
                                type="text"
                                value={searchNombre}
                                onChange={(e) => setSearchNombre(e.target.value)}
                                className="input-field"
                                placeholder="Buscar por nombre, apellido o email..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Filter size={16} />
                                Tipo de Evaluación
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Todas</option>
                                <option value="INICIAL">Inicial</option>
                                <option value="PERIODICA">Periódica</option>
                                <option value="FINAL">Final</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : evaluaciones.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron evaluaciones</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {evaluaciones.map((evaluacion) => {
                                const imc = calcularIMC(
                                    evaluacion.medicion?.peso_kg,
                                    evaluacion.medicion?.altura_m
                                );
                                const clasificacion = getClasificacionIMC(imc);

                                return (
                                    <div key={evaluacion.id_evaluacion} className="card-hover animate-fadeIn">
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                                {evaluacion.paciente?.nombre?.charAt(0) || 'P'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">
                                                    {evaluacion.paciente?.nombre} {evaluacion.paciente?.apellido}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(evaluacion.tipo)}`}>
                                                        {evaluacion.tipo}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Stethoscope size={16} className="text-gray-400" />
                                                <span>{evaluacion.nutricionista?.nombre} {evaluacion.nutricionista?.apellido}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span>{new Date(evaluacion.fecha).toLocaleDateString('es-ES', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                        </div>

                                        {/* Mediciones */}
                                        {evaluacion.medicion && (
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Scale size={18} className="text-blue-600 dark:text-blue-400" />
                                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Peso</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                        {evaluacion.medicion.peso_kg}
                                                    </p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">kilogramos</p>
                                                </div>

                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Ruler size={18} className="text-purple-600 dark:text-purple-400" />
                                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Altura</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                        {evaluacion.medicion.altura_m}
                                                    </p>
                                                    <p className="text-xs text-purple-600 dark:text-purple-400">metros</p>
                                                </div>

                                                <div className={`bg-gradient-to-br from-${clasificacion.color}-50 to-${clasificacion.color}-100 dark:from-${clasificacion.color}-900/20 dark:to-${clasificacion.color}-800/20 p-4 rounded-xl border border-${clasificacion.color}-200 dark:border-${clasificacion.color}-800`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Activity size={18} className={`text-${clasificacion.color}-600 dark:text-${clasificacion.color}-400`} />
                                                        <span className={`text-xs font-medium text-${clasificacion.color}-600 dark:text-${clasificacion.color}-400`}>IMC</span>
                                                    </div>
                                                    <p className={`text-2xl font-bold text-${clasificacion.color}-700 dark:text-${clasificacion.color}-300`}>
                                                        {imc}
                                                    </p>
                                                    <p className={`text-xs text-${clasificacion.color}-600 dark:text-${clasificacion.color}-400`}>
                                                        {clasificacion.texto}
                                                    </p>
                                                </div>

                                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingUp size={18} className="text-orange-600 dark:text-orange-400" />
                                                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">% Grasa</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                                        {evaluacion.medicion.porc_grasa || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-orange-600 dark:text-orange-400">porcentaje</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Observaciones */}
                                        {evaluacion.observaciones && (
                                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Observaciones</p>
                                                </div>
                                                <p className="text-sm text-blue-700 dark:text-blue-400">{evaluacion.observaciones}</p>
                                            </div>
                                        )}

                                        {/* Botón Eliminar */}
                                        <button
                                            onClick={() => handleDelete(evaluacion.id_evaluacion)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400 rounded-xl hover:shadow-md transition-all text-sm font-medium border border-red-200 dark:border-red-800"
                                        >
                                            <Trash2 size={16} />
                                            Eliminar Evaluación
                                        </button>
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

export default EvaluacionesIndex;
