import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
    Search, 
    Filter, 
    X, 
    ChevronDown, 
    ChevronUp,
    Apple,
    Zap,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente para búsqueda y filtrado avanzado de alimentos
 * Feature: mejoras-sistema-core, Tarea 5.6
 */
const AlimentoSearchForm = ({ 
    onResults, 
    onLoading,
    initialFilters = {},
    showAdvancedFilters = true,
    compact = false
}) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [filters, setFilters] = useState({
        categoria: initialFilters.categoria || '',
        disponible: initialFilters.disponible ?? true,
        calorias_min: initialFilters.calorias_min || '',
        calorias_max: initialFilters.calorias_max || '',
        proteinas_min: initialFilters.proteinas_min || '',
        proteinas_max: initialFilters.proteinas_max || '',
        carbohidratos_min: initialFilters.carbohidratos_min || '',
        carbohidratos_max: initialFilters.carbohidratos_max || '',
        grasas_min: initialFilters.grasas_min || '',
        grasas_max: initialFilters.grasas_max || '',
        sort_by: initialFilters.sort_by || 'nombre',
        sort_order: initialFilters.sort_order || 'asc'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const categorias = [
        { value: '', label: 'Todas las categorías' },
        { value: 'fruta', label: 'Frutas' },
        { value: 'verdura', label: 'Verduras' },
        { value: 'cereal', label: 'Cereales' },
        { value: 'proteina', label: 'Proteínas' },
        { value: 'lacteo', label: 'Lácteos' },
        { value: 'grasa', label: 'Grasas' },
        { value: 'otro', label: 'Otros' }
    ];

    const sortOptions = [
        { value: 'nombre', label: 'Nombre' },
        { value: 'categoria', label: 'Categoría' },
        { value: 'calorias_por_100g', label: 'Calorías' },
        { value: 'proteinas_por_100g', label: 'Proteínas' },
        { value: 'carbohidratos_por_100g', label: 'Carbohidratos' },
        { value: 'grasas_por_100g', label: 'Grasas' }
    ];

    // Función para realizar la búsqueda
    const performSearch = useCallback(async (searchParams = {}) => {
        try {
            setLoading(true);
            onLoading?.(true);

            const params = new URLSearchParams();
            
            // Agregar término de búsqueda
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }
            
            // Agregar filtros
            Object.entries({ ...filters, ...searchParams }).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const response = await fetch(`/api/alimentos?${params.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                onResults?.(data);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Error al buscar alimentos');
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            toast.error('Error al realizar la búsqueda');
        } finally {
            setLoading(false);
            onLoading?.(false);
        }
    }, [searchTerm, filters, onResults, onLoading]);

    // Búsqueda con debounce
    const debouncedSearch = useCallback((searchParams = {}) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        const timer = setTimeout(() => {
            performSearch(searchParams);
        }, 300);
        
        setDebounceTimer(timer);
    }, [performSearch, debounceTimer]);

    // Efecto para búsqueda automática cuando cambia el término
    useEffect(() => {
        debouncedSearch();
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [searchTerm]);

    // Manejar cambios en filtros
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        debouncedSearch();
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            categoria: '',
            disponible: true,
            calorias_min: '',
            calorias_max: '',
            proteinas_min: '',
            proteinas_max: '',
            carbohidratos_min: '',
            carbohidratos_max: '',
            grasas_min: '',
            grasas_max: '',
            sort_by: 'nombre',
            sort_order: 'asc'
        });
        performSearch({
            categoria: '',
            disponible: true,
            sort_by: 'nombre',
            sort_order: 'asc'
        });
    };

    // Contar filtros activos
    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'disponible') return value !== true;
        if (key === 'sort_by') return value !== 'nombre';
        if (key === 'sort_order') return value !== 'asc';
        return value !== '' && value !== null && value !== undefined;
    }).length + (searchTerm.trim() ? 1 : 0);

    return (
        <Card className={compact ? 'shadow-sm' : ''}>
            <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
                <div className="flex items-center justify-between">
                    <CardTitle className={compact ? 'text-base' : 'text-lg'}>Buscar Alimentos</CardTitle>
                    {showAdvancedFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Barra de búsqueda principal */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre de alimento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Filtros rápidos */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={filters.categoria === 'fruta' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('categoria', filters.categoria === 'fruta' ? '' : 'fruta')}
                        className="flex items-center gap-1"
                    >
                        <Apple className="h-3 w-3" />
                        Frutas
                    </Button>
                    <Button
                        variant={filters.categoria === 'proteina' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('categoria', filters.categoria === 'proteina' ? '' : 'proteina')}
                        className="flex items-center gap-1"
                    >
                        <Zap className="h-3 w-3" />
                        Proteínas
                    </Button>
                    <Button
                        variant={filters.disponible === false ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('disponible', !filters.disponible)}
                        className="flex items-center gap-1"
                    >
                        <Activity className="h-3 w-3" />
                        {filters.disponible ? 'Solo disponibles' : 'Incluir no disponibles'}
                    </Button>
                </div>

                {/* Filtros avanzados */}
                {showFilters && showAdvancedFilters && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        {/* Categoría y disponibilidad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Categoría</label>
                                <select
                                    value={filters.categoria}
                                    onChange={(e) => handleFilterChange('categoria', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categorias.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Ordenar por</label>
                                <div className="flex gap-2">
                                    <select
                                        value={filters.sort_by}
                                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.sort_order}
                                        onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="asc">A-Z</option>
                                        <option value="desc">Z-A</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Filtros nutricionales */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Filtros Nutricionales</h4>
                            
                            {/* Calorías */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Calorías (por 100g)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Mínimo"
                                            value={filters.calorias_min}
                                            onChange={(e) => handleFilterChange('calorias_min', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={filters.calorias_max}
                                            onChange={(e) => handleFilterChange('calorias_max', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Proteínas */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Proteínas (g por 100g)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Mínimo"
                                            value={filters.proteinas_min}
                                            onChange={(e) => handleFilterChange('proteinas_min', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={filters.proteinas_max}
                                            onChange={(e) => handleFilterChange('proteinas_max', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Carbohidratos */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Carbohidratos (g por 100g)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Mínimo"
                                            value={filters.carbohidratos_min}
                                            onChange={(e) => handleFilterChange('carbohidratos_min', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={filters.carbohidratos_max}
                                            onChange={(e) => handleFilterChange('carbohidratos_max', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Grasas */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Grasas (g por 100g)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Mínimo"
                                            value={filters.grasas_min}
                                            onChange={(e) => handleFilterChange('grasas_min', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Máximo"
                                            value={filters.grasas_max}
                                            onChange={(e) => handleFilterChange('grasas_max', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botón para limpiar filtros */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                disabled={loading || activeFiltersCount === 0}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                )}

                {/* Indicador de carga */}
                {loading && (
                    <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-500">Buscando...</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AlimentoSearchForm;
