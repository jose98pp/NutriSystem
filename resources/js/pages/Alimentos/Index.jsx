import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { 
    Plus, Search, Apple, Salad, Wheat, Beef, Milk, Droplet, Package,
    Flame, Activity, Eye, Edit, Trash2, Grid, List, Filter,
    AlertTriangle, Download
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { logApiError } from '../../utils/logger';

const AlimentosIndex = () => {
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'table'
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [caloriaRange, setCaloriaRange] = useState([0, 1000]);
    const [proteinaRange, setProteinaRange] = useState([0, 100]);
    const [selectedAlimento, setSelectedAlimento] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const toast = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        fetchAlimentos();
    }, []);

    const fetchAlimentos = async () => {
        try {
            const response = await api.get('/alimentos');
            setAlimentos(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            logApiError('/alimentos', error);
            toast.error('Error al cargar alimentos');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const alimento = alimentos.find(a => a.id_alimento === id);
        
        const confirmed = await confirm({
            title: 'Eliminar Alimento',
            message: `¿Estás seguro de que deseas eliminar "${alimento?.nombre}"?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/alimentos/${id}`);
            toast.success('Alimento eliminado exitosamente');
            fetchAlimentos();
        } catch (error) {
            logApiError(`/alimentos/${id}`, error);
            toast.error('Error al eliminar el alimento');
        }
    };

    const categoriaConfig = {
        fruta: {
            label: 'Frutas',
            icon: Apple,
            gradient: 'from-red-500 to-pink-500',
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-400',
            iconColor: 'text-red-600 dark:text-red-400'
        },
        verdura: {
            label: 'Verduras',
            icon: Salad,
            gradient: 'from-green-500 to-emerald-500',
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-800 dark:text-green-400',
            iconColor: 'text-green-600 dark:text-green-400'
        },
        cereal: {
            label: 'Cereales',
            icon: Wheat,
            gradient: 'from-yellow-500 to-orange-500',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-800 dark:text-yellow-400',
            iconColor: 'text-yellow-600 dark:text-yellow-400'
        },
        proteina: {
            label: 'Proteínas',
            icon: Beef,
            gradient: 'from-red-600 to-red-800',
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-400',
            iconColor: 'text-red-600 dark:text-red-400'
        },
        lacteo: {
            label: 'Lácteos',
            icon: Milk,
            gradient: 'from-blue-400 to-cyan-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-800 dark:text-blue-400',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        grasa: {
            label: 'Grasas',
            icon: Droplet,
            gradient: 'from-amber-500 to-yellow-500',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-800 dark:text-amber-400',
            iconColor: 'text-amber-600 dark:text-amber-400'
        },
        otro: {
            label: 'Otros',
            icon: Package,
            gradient: 'from-gray-500 to-gray-700',
            bg: 'bg-gray-100 dark:bg-gray-900/30',
            text: 'text-gray-800 dark:text-gray-400',
            iconColor: 'text-gray-600 dark:text-gray-400'
        }
    };

    const getCategoriaConfig = (cat) => categoriaConfig[cat] || categoriaConfig.otro;

    const getCaloriaColor = (calorias) => {
        if (calorias < 100) return 'text-green-600 dark:text-green-400';
        if (calorias < 300) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-orange-600 dark:text-orange-400';
    };

    const filteredAlimentos = alimentos.filter(alimento => {
        const matchesSearch = !search || 
            alimento.nombre.toLowerCase().includes(search.toLowerCase());
        const matchesCategoria = !categoria || alimento.categoria === categoria;
        const matchesCalorias = alimento.calorias_por_100g >= caloriaRange[0] && 
            alimento.calorias_por_100g <= caloriaRange[1];
        const matchesProteinas = alimento.proteinas_por_100g >= proteinaRange[0] && 
            alimento.proteinas_por_100g <= proteinaRange[1];
        
        return matchesSearch && matchesCategoria && 
            (!showAdvancedFilters || (matchesCalorias && matchesProteinas));
    });

    const stats = {
        total: alimentos.length,
        categoriaPrincipal: alimentos.reduce((acc, a) => {
            acc[a.categoria] = (acc[a.categoria] || 0) + 1;
            return acc;
        }, {}),
        caloriasPromedio: alimentos.length > 0 
            ? Math.round(alimentos.reduce((sum, a) => sum + parseFloat(a.calorias_por_100g || 0), 0) / alimentos.length)
            : 0,
        proteinasPromedio: alimentos.length > 0
            ? (alimentos.reduce((sum, a) => sum + parseFloat(a.proteinas_por_100g || 0), 0) / alimentos.length).toFixed(1)
            : 0
    };

    const categoriaMasComun = Object.entries(stats.categoriaPrincipal)
        .sort((a, b) => b[1] - a[1])[0];

    const exportToCSV = () => {
        const headers = ['Nombre', 'Categoría', 'Calorías (kcal)', 'Proteínas (g)', 'Carbohidratos (g)', 'Grasas (g)', 'Restricciones'];
        const rows = filteredAlimentos.map(a => [
            a.nombre,
            getCategoriaConfig(a.categoria).label,
            a.calorias_por_100g,
            a.proteinas_por_100g,
            a.carbohidratos_por_100g,
            a.grasas_por_100g,
            a.restricciones || 'Ninguna'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `alimentos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Datos exportados exitosamente');
    };

    const MacroBar = ({ label, value, max, color }) => {
        const percentage = Math.min((value / max) * 100, 100);
        const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            orange: 'bg-orange-500'
        };

        return (
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{value}g</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Catálogo de Alimentos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Información nutricional por 100g</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToCSV}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            title="Exportar a CSV"
                        >
                            <Download size={20} />
                            Exportar
                        </button>
                        <Link
                            to="/alimentos/nuevo"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Nuevo Alimento
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Alimentos</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <Package className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                        </div>
                    </div>
                    
                    {categoriaMasComun && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Categoría Principal</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                        {getCategoriaConfig(categoriaMasComun[0]).label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{categoriaMasComun[1]} alimentos</p>
                                </div>
                                <div className={`bg-gradient-to-br ${getCategoriaConfig(categoriaMasComun[0]).gradient} p-3 rounded-full`}>
                                    {React.createElement(getCategoriaConfig(categoriaMasComun[0]).icon, {
                                        className: "text-white",
                                        size: 24
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Calorías Promedio</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.caloriasPromedio}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">kcal/100g</p>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                                <Flame className="text-orange-600 dark:text-orange-400" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Proteínas Promedio</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.proteinasPromedio}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">g/100g</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <Activity className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar alimento..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Todas las categorías</option>
                            {Object.entries(categoriaConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex-1 p-2 rounded-lg transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                title="Vista de tarjetas"
                            >
                                <Grid size={20} className="mx-auto" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex-1 p-2 rounded-lg transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                title="Vista de tabla"
                            >
                                <List size={20} className="mx-auto" />
                            </button>
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`p-2 rounded-lg transition-colors ${
                                    showAdvancedFilters
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                title="Filtros avanzados"
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filtros Avanzados</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Calorías: {caloriaRange[0]} - {caloriaRange[1]} kcal
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={caloriaRange[1]}
                                        onChange={(e) => setCaloriaRange([0, parseInt(e.target.value)])}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Proteínas: {proteinaRange[0]} - {proteinaRange[1]} g
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={proteinaRange[1]}
                                        onChange={(e) => setProteinaRange([0, parseInt(e.target.value)])}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando alimentos...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAlimentos.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                                No se encontraron alimentos
                            </div>
                        ) : (
                            filteredAlimentos.map((alimento) => {
                                const config = getCategoriaConfig(alimento.categoria);
                                const IconComponent = config.icon;
                                
                                return (
                                    <div
                                        key={alimento.id_alimento}
                                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-4 border border-gray-200 dark:border-gray-700"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                <IconComponent className="text-white" size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                                                    {alimento.nombre}
                                                </h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text} inline-block`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Calorías Destacadas */}
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Calorías</span>
                                                <div className="flex items-center gap-1">
                                                    <Flame className="text-orange-500" size={16} />
                                                    <span className={`text-2xl font-bold ${getCaloriaColor(alimento.calorias_por_100g)}`}>
                                                        {alimento.calorias_por_100g}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">kcal</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Macronutrientes */}
                                        <div className="space-y-3 mb-4">
                                            <MacroBar 
                                                label="Proteínas" 
                                                value={parseFloat(alimento.proteinas_por_100g || 0)} 
                                                max={30} 
                                                color="blue" 
                                            />
                                            <MacroBar 
                                                label="Carbohidratos" 
                                                value={parseFloat(alimento.carbohidratos_por_100g || 0)} 
                                                max={100} 
                                                color="green" 
                                            />
                                            <MacroBar 
                                                label="Grasas" 
                                                value={parseFloat(alimento.grasas_por_100g || 0)} 
                                                max={30} 
                                                color="orange" 
                                            />
                                        </div>

                                        {/* Restricciones */}
                                        {alimento.restricciones && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-4 flex items-start gap-2">
                                                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                                                <span className="text-xs text-red-600 dark:text-red-400">{alimento.restricciones}</span>
                                            </div>
                                        )}

                                        {/* Acciones */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedAlimento(alimento);
                                                    setShowModal(true);
                                                }}
                                                className="flex-1 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye size={18} className="mx-auto" />
                                            </button>
                                            <Link
                                                to={`/alimentos/${alimento.id_alimento}/editar`}
                                                className="flex-1 p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(alimento.id_alimento)}
                                                className="flex-1 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} className="mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    /* Table View */
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Alimento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Calorías
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Proteínas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Carbohidratos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Grasas
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAlimentos.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No se encontraron alimentos
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAlimentos.map((alimento) => {
                                            const config = getCategoriaConfig(alimento.categoria);
                                            const IconComponent = config.icon;
                                            
                                            return (
                                                <tr key={alimento.id_alimento} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className={`flex-shrink-0 h-10 w-10 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center`}>
                                                                <IconComponent className="text-white" size={20} />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {alimento.nombre}
                                                                </div>
                                                                {alimento.restricciones && (
                                                                    <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                                        <AlertTriangle size={12} />
                                                                        Restricciones
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
                                                            {config.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1">
                                                            <Flame className="text-orange-500" size={14} />
                                                            <span className={`text-sm font-medium ${getCaloriaColor(alimento.calorias_por_100g)}`}>
                                                                {alimento.calorias_por_100g}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">kcal</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {alimento.proteinas_por_100g}g
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {alimento.carbohidratos_por_100g}g
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {alimento.grasas_por_100g}g
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAlimento(alimento);
                                                                    setShowModal(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <Link
                                                                to={`/alimentos/${alimento.id_alimento}/editar`}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(alimento.id_alimento)}
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
                {!loading && alimentos.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {filteredAlimentos.length} de {alimentos.length} alimentos
                    </div>
                )}

                {/* Modal de Detalles */}
                {showModal && selectedAlimento && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${getCategoriaConfig(selectedAlimento.categoria).gradient} rounded-full flex items-center justify-center`}>
                                            {React.createElement(getCategoriaConfig(selectedAlimento.categoria).icon, {
                                                className: "text-white",
                                                size: 32
                                            })}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {selectedAlimento.nombre}
                                            </h2>
                                            <span className={`text-sm px-3 py-1 rounded-full ${getCategoriaConfig(selectedAlimento.categoria).bg} ${getCategoriaConfig(selectedAlimento.categoria).text}`}>
                                                {getCategoriaConfig(selectedAlimento.categoria).label}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Información Nutricional */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Información Nutricional (por 100g)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Flame className="text-orange-500" size={20} />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Calorías</span>
                                                </div>
                                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                                    {selectedAlimento.calorias_por_100g}
                                                    <span className="text-sm ml-1">kcal</span>
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Activity className="text-blue-500" size={20} />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Proteínas</span>
                                                </div>
                                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                    {selectedAlimento.proteinas_por_100g}
                                                    <span className="text-sm ml-1">g</span>
                                                </p>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Carbohidratos</span>
                                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                    {selectedAlimento.carbohidratos_por_100g}
                                                    <span className="text-sm ml-1">g</span>
                                                </p>
                                            </div>
                                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Grasas</span>
                                                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                                    {selectedAlimento.grasas_por_100g}
                                                    <span className="text-sm ml-1">g</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Macronutrientes Visuales */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Distribución de Macronutrientes
                                        </h3>
                                        <div className="space-y-4">
                                            <MacroBar 
                                                label="Proteínas" 
                                                value={parseFloat(selectedAlimento.proteinas_por_100g || 0)} 
                                                max={30} 
                                                color="blue" 
                                            />
                                            <MacroBar 
                                                label="Carbohidratos" 
                                                value={parseFloat(selectedAlimento.carbohidratos_por_100g || 0)} 
                                                max={100} 
                                                color="green" 
                                            />
                                            <MacroBar 
                                                label="Grasas" 
                                                value={parseFloat(selectedAlimento.grasas_por_100g || 0)} 
                                                max={30} 
                                                color="orange" 
                                            />
                                        </div>
                                    </div>

                                    {/* Restricciones */}
                                    {selectedAlimento.restricciones && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={20} />
                                                <div>
                                                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                                                        Restricciones y Advertencias
                                                    </h4>
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {selectedAlimento.restricciones}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <Link
                                        to={`/alimentos/${selectedAlimento.id_alimento}/editar`}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Edit size={18} />
                                        Editar Alimento
                                    </Link>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AlimentosIndex;
