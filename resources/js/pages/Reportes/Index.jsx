import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    Search, TrendingUp, Activity, Calendar, Users, 
    BarChart3, PieChart as PieChartIcon, Target, Award,
    ArrowLeft, Filter
} from 'lucide-react';
import { useToast } from '../../components/Toast';

const ReportesIndex = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [pacienteId, setPacienteId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [ingestas, setIngestas] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [paciente, setPaciente] = useState(null);
    const [rangoFechas, setRangoFechas] = useState(30); // días

    useEffect(() => {
        if (pacienteId) {
            fetchReportes();
        }
    }, [pacienteId, rangoFechas]);

    // Buscar pacientes mientras se escribe
    useEffect(() => {
        if (searchTerm.length >= 2) {
            const delayDebounce = setTimeout(() => {
                searchPacientes();
            }, 300);
            return () => clearTimeout(delayDebounce);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchTerm]);

    const searchPacientes = async () => {
        setSearchLoading(true);
        try {
            const response = await api.get('/pacientes', {
                params: { search: searchTerm }
            });
            setSearchResults(response.data.data || response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Error al buscar pacientes:', error);
            toast.error('Error al buscar pacientes');
        } finally {
            setSearchLoading(false);
        }
    };

    const selectPaciente = (paciente) => {
        setPacienteId(paciente.id_paciente);
        setPaciente(paciente);
        setSearchTerm('');
        setShowResults(false);
        setSearchResults([]);
    };

    const fetchReportes = async () => {
        setLoading(true);
        try {
            // Obtener datos del paciente
            const pacienteRes = await api.get(`/pacientes/${pacienteId}`);
            setPaciente(pacienteRes.data);

            // Obtener evaluaciones
            const evalRes = await api.get('/evaluaciones', {
                params: { paciente_id: pacienteId }
            });
            setEvaluaciones(evalRes.data.data || evalRes.data);

            // Obtener ingestas de los últimos días
            const hoy = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - rangoFechas);

            const ingestasRes = await api.get('/ingestas', {
                params: {
                    paciente_id: pacienteId,
                    fecha_inicio: inicio.toISOString().split('T')[0],
                    fecha_fin: hoy.toISOString().split('T')[0]
                }
            });
            setIngestas(ingestasRes.data.data || ingestasRes.data);

            // Obtener planes
            const planesRes = await api.get('/planes', {
                params: { paciente_id: pacienteId }
            });
            setPlanes(planesRes.data.data || planesRes.data);

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            toast.error('Error al cargar los datos del paciente');
            setPacienteId('');
            setPaciente(null);
        } finally {
            setLoading(false);
        }
    };

    // Preparar datos para gráfico de evolución de peso
    const dataPeso = evaluaciones
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(evaluacion => ({
            fecha: format(new Date(evaluacion.fecha), 'dd/MM', { locale: es }),
            peso: evaluacion.medicion?.peso_kg || 0,
            imc: evaluacion.medicion?.peso_kg && evaluacion.medicion?.altura_m 
                ? (evaluacion.medicion.peso_kg / (evaluacion.medicion.altura_m ** 2)).toFixed(2)
                : 0
        }));

    // Calcular adherencia al plan
    const calcularAdherencia = () => {
        if (planes.length === 0 || ingestas.length === 0) return 0;
        
        const planActivo = planes.find(p => {
            const hoy = new Date();
            const inicio = new Date(p.fecha_inicio);
            const fin = new Date(p.fecha_fin);
            return hoy >= inicio && hoy <= fin;
        });

        if (!planActivo) return 0;

        // Calcular días con ingestas vs días del plan
        const diasConIngesta = new Set(
            ingestas.map(i => new Date(i.fecha_hora).toDateString())
        ).size;

        const diasTranscurridos = Math.min(
            Math.ceil((new Date() - new Date(planActivo.fecha_inicio)) / (1000 * 60 * 60 * 24)),
            rangoFechas
        );

        return diasTranscurridos > 0 ? Math.round((diasConIngesta / diasTranscurridos) * 100) : 0;
    };

    // Preparar datos para gráfico de calorías diarias
    const dataIngestas = ingestas
        .reduce((acc, ingesta) => {
            const fecha = format(new Date(ingesta.fecha_hora), 'dd/MM', { locale: es });
            const calorias = ingesta.alimentos?.reduce((sum, a) => 
                sum + (a.calorias_por_100g * (a.pivot?.cantidad_gramos || 0) / 100), 0
            ) || 0;

            const existing = acc.find(d => d.fecha === fecha);
            if (existing) {
                existing.calorias += calorias;
            } else {
                acc.push({ fecha, calorias });
            }
            return acc;
        }, [])
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Distribución de macronutrientes
    const macronutrientes = ingestas.reduce((acc, ingesta) => {
        ingesta.alimentos?.forEach(alimento => {
            const factor = (alimento.pivot?.cantidad_gramos || 0) / 100;
            acc.proteinas += alimento.proteinas_por_100g * factor;
            acc.carbohidratos += alimento.carbohidratos_por_100g * factor;
            acc.grasas += alimento.grasas_por_100g * factor;
        });
        return acc;
    }, { proteinas: 0, carbohidratos: 0, grasas: 0 });

    const dataMacros = [
        { name: 'Proteínas', value: Math.round(macronutrientes.proteinas), color: '#3b82f6' },
        { name: 'Carbohidratos', value: Math.round(macronutrientes.carbohidratos), color: '#eab308' },
        { name: 'Grasas', value: Math.round(macronutrientes.grasas), color: '#f97316' }
    ];

    const adherencia = calcularAdherencia();

    if (!pacienteId) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto py-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <BarChart3 className="text-blue-600 dark:text-blue-400" size={40} />
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Reportes y Progreso</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Busca un paciente por nombre, apellido o email para ver sus reportes
                        </p>
                    </div>

                    {/* Buscador */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, apellido o email..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg"
                                autoFocus
                            />
                            {searchLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>

                        {/* Resultados de búsqueda */}
                        {showResults && searchResults.length > 0 && (
                            <div className="mt-4 border dark:border-gray-600 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                {searchResults.map((pac) => (
                                    <button
                                        key={pac.id_paciente}
                                        onClick={() => selectPaciente(pac)}
                                        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-600 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                {pac.nombre.charAt(0)}{pac.apellido.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {pac.nombre} {pac.apellido}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{pac.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {pac.id_paciente}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showResults && searchResults.length === 0 && !searchLoading && (
                            <div className="mt-4 text-center py-8 text-gray-500 dark:text-gray-400">
                                <Users className="mx-auto mb-2 text-gray-400" size={48} />
                                <p>No se encontraron pacientes</p>
                            </div>
                        )}

                        {!showResults && searchTerm.length === 0 && (
                            <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
                                <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
                            </div>
                        )}
                    </div>

                    {/* Ayuda */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 <strong>Tip:</strong> Puedes buscar por nombre completo, apellido o dirección de email del paciente
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <BarChart3 size={32} />
                            Reportes y Progreso
                        </h1>
                        {paciente && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {paciente.nombre} {paciente.apellido}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{paciente.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={rangoFechas}
                                onChange={(e) => setRangoFechas(Number(e.target.value))}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value={7}>Últimos 7 días</option>
                                <option value={15}>Últimos 15 días</option>
                                <option value={30}>Últimos 30 días</option>
                                <option value={90}>Últimos 90 días</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setPacienteId('');
                                setPaciente(null);
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Cambiar Paciente
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando reportes...</p>
                    </div>
                ) : (
                    <>
                        {/* Tarjetas de Resumen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Evaluaciones</span>
                                    <Activity className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{evaluaciones.length}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registradas</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Ingestas</span>
                                    <PieChartIcon className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{ingestas.length}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimos {rangoFechas} días</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Adherencia</span>
                                    <Target className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{adherencia}%</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Al plan actual</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Planes</span>
                                    <Award className="text-orange-600 dark:text-orange-400" size={24} />
                                </div>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{planes.length}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Asignados</p>
                            </div>
                        </div>

                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Evolución de Peso */}
                            {dataPeso.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <TrendingUp size={20} />
                                        Evolución de Peso e IMC
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={dataPeso}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={2} name="Peso (kg)" />
                                            <Line yAxisId="right" type="monotone" dataKey="imc" stroke="#22c55e" strokeWidth={2} name="IMC" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Calorías Diarias */}
                            {dataIngestas.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <BarChart3 size={20} />
                                        Calorías Diarias
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dataIngestas}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="fecha" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="calorias" fill="#22c55e" name="Calorías (kcal)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Distribución de Macronutrientes */}
                            {dataMacros.some(d => d.value > 0) && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <PieChartIcon size={20} />
                                        Distribución de Macronutrientes (g)
                                    </h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={dataMacros}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}g`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {dataMacros.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Indicador de Adherencia */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Target size={20} />
                                    Adherencia al Plan
                                </h3>
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="relative w-48 h-48">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle
                                                className="text-gray-200 stroke-current"
                                                strokeWidth="10"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                            />
                                            <circle
                                                className="text-primary-600 stroke-current"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                strokeDasharray={`${adherencia * 2.51}, 251`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-5xl font-bold text-primary-600">{adherencia}%</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mt-4 text-center">
                                        Días con registro en los últimos {rangoFechas} días
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mensajes de estado */}
                        {evaluaciones.length === 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <p className="text-yellow-800 dark:text-yellow-300">⚠️ No hay evaluaciones registradas para este paciente</p>
                            </div>
                        )}

                        {ingestas.length === 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <p className="text-yellow-800 dark:text-yellow-300">⚠️ No hay ingestas registradas en el período seleccionado</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ReportesIndex;
