import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { logApiError } from '../utils/logger';
import api from '../config/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, TrendingUp, Target, MessageSquare, Utensils, Camera, Calendar, Award, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className={`stat-card ${color} border border-opacity-20`}>
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${color.replace('from-', 'bg-').replace('to-', '').split(' ')[0]}/20 rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color.includes('green') ? 'text-green-600 dark:text-green-400' : color.includes('blue') ? 'text-blue-600 dark:text-blue-400' : color.includes('purple') ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            {trend && (
                <span className={`badge ${trend > 0 ? 'badge-success' : 'badge-error'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div className={`stat-value ${color.includes('green') ? 'text-green-600 dark:text-green-400' : color.includes('blue') ? 'text-blue-600 dark:text-blue-400' : color.includes('purple') ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {value}
        </div>
        <div className={`stat-label ${color.includes('green') ? 'text-green-700 dark:text-green-300' : color.includes('blue') ? 'text-blue-700 dark:text-blue-300' : color.includes('purple') ? 'text-purple-700 dark:text-purple-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {title}
        </div>
        {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {subtitle}
            </p>
        )}
    </div>
);

const Dashboard = () => {
    const { user, isAdmin, isNutricionista, isPaciente } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            logApiError('/dashboard/stats', error);
            toast.error('Error al cargar las estadísticas del dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Dashboard para Nutricionista/Admin
    const NutricionistaDashboard = () => {
        const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

        const imcData = stats?.distribucion_imc ? [
            { name: 'Bajo Peso', value: stats.distribucion_imc.bajo_peso },
            { name: 'Normal', value: stats.distribucion_imc.normal },
            { name: 'Sobrepeso', value: stats.distribucion_imc.sobrepeso },
            { name: 'Obesidad', value: stats.distribucion_imc.obesidad }
        ] : [];

        return (
            <div className="space-y-6">
                {/* KPIs Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                    <StatCard
                        title="Total Pacientes"
                        value={stats?.totales?.pacientes || 0}
                        icon={Users}
                        color="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                        subtitle={`${stats?.totales?.pacientes_activos || 0} activos`}
                        trend={12}
                    />
                    <StatCard
                        title="Planes Activos"
                        value={stats?.totales?.planes_activos || 0}
                        icon={FileText}
                        color="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                        subtitle={`${stats?.totales?.planes || 0} totales`}
                        trend={8}
                    />
                    <StatCard
                        title="Evaluaciones"
                        value={stats?.totales?.evaluaciones_mes || 0}
                        icon={Activity}
                        color="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
                        subtitle="este mes"
                        trend={15}
                    />
                    <StatCard
                        title="Mensajes"
                        value={stats?.totales?.mensajes_no_leidos || 0}
                        icon={MessageSquare}
                        color="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
                        subtitle="sin leer"
                        trend={-2}
                    />
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tendencia de Peso Promedio */}
                    <div className="card-gradient animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tendencia de Peso Promedio</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Últimos 6 meses</p>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats?.tendencia_peso || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="peso_promedio" stroke="#8884d8" strokeWidth={2} name="Peso Promedio (kg)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Distribución de IMC */}
                    <div className="card-gradient animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Distribución de IMC</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado actual</p>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={imcData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {imcData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Pacientes */}
                <div className="card animate-fadeIn">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Top 5 Mejores Progresos</h3>
                    </div>
                    <div className="space-y-3">
                        {stats?.top_pacientes?.length > 0 ? (
                            stats.top_pacientes.map((pac, index) => (
                                <div key={pac.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 rounded-xl border border-primary-200 dark:border-primary-800 hover:shadow-md transition-all duration-200">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{pac.nombre}</p>
                                        <p className="text-sm text-gray-600">
                                            {pac.peso_inicial}kg → {pac.peso_actual}kg
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">-{pac.perdida_peso}kg</p>
                                        <p className="text-xs text-gray-500">{pac.evaluaciones} evaluaciones</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay datos suficientes</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Dashboard para Paciente
    const PacienteDashboard = () => {
        const evolucionData = stats?.evolucion_peso?.map(e => ({
            fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            peso: e.peso_kg
        })) || [];

        return (
            <div className="space-y-6">
                {/* KPIs del Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                    <StatCard
                        title="Ingestas Totales"
                        value={stats?.totales?.ingestas || 0}
                        icon={Utensils}
                        color="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
                        subtitle={`${stats?.totales?.ingestas_semana || 0} esta semana`}
                        trend={10}
                    />
                    <StatCard
                        title="Evaluaciones"
                        value={stats?.totales?.evaluaciones || 0}
                        icon={Activity}
                        color="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
                        subtitle="realizadas"
                    />
                    <StatCard
                        title="Fotos Progreso"
                        value={stats?.totales?.fotos_progreso || 0}
                        icon={Camera}
                        color="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                        subtitle="subidas"
                    />
                    <StatCard
                        title="Mensajes"
                        value={stats?.totales?.mensajes_no_leidos || 0}
                        icon={MessageSquare}
                        color="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                        subtitle="sin leer"
                    />
                </div>

                {/* Progreso hacia el Objetivo */}
                {stats?.progreso_objetivo && (
                    <div className="card-gradient bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20 border-2 border-primary-200 dark:border-primary-800 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Progreso hacia tu Objetivo</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Peso Inicial</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.progreso_objetivo.peso_inicial} kg</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Peso Actual</p>
                                <p className="text-4xl font-bold text-primary-600">{stats.progreso_objetivo.peso_actual} kg</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Peso Objetivo</p>
                                <p className="text-3xl font-bold text-green-600">{stats.progreso_objetivo.peso_objetivo} kg</p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">Progreso: {stats.progreso_objetivo.porcentaje}%</span>
                                <span className="font-medium">{stats.progreso_objetivo.perdido_hasta_ahora} / {stats.progreso_objetivo.total_a_perder} kg</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-green-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(stats.progreso_objetivo.porcentaje, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evolución de Peso */}
                <div className="card-gradient animate-fadeIn">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Evolución de Peso</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tu progreso en el tiempo</p>
                        </div>
                    </div>
                    {evolucionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={evolucionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="fecha" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="peso" stroke="#8b5cf6" strokeWidth={3} name="Peso (kg)" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No hay datos de peso registrados</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {isNutricionista() ? 'Panel de control del nutricionista' : 'Tu resumen personal'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="text-gray-600 mt-4">Cargando estadísticas...</p>
                    </div>
                ) : !stats ? (
                    <div className="card text-center py-12">
                        <span className="text-6xl mb-4 block">⚠️</span>
                        <p className="text-gray-600">Error al cargar estadísticas</p>
                    </div>
                ) : (
                    <>
                        {(isNutricionista() || isAdmin()) ? <NutricionistaDashboard /> : <PacienteDashboard />}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
