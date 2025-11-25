import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { logApiError } from '../../utils/logger';

const RecetasIndex = () => {
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const toast = useToast();
    const { confirm } = useConfirm();

    useEffect(() => {
        fetchRecetas();
    }, [search, currentPage]);

    const fetchRecetas = async () => {
        try {
            const response = await api.get('/recetas', {
                params: { search, page: currentPage, per_page: 12 }
            });
            setRecetas(response.data.data.data);
            setLastPage(response.data.data.last_page);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const receta = recetas.find(r => r.id_receta === id);
        
        const confirmed = await confirm({
            title: 'Eliminar Receta',
            message: `¿Estás seguro de que deseas eliminar "${receta?.nombre}"?`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.delete(`/recetas/${id}`);
            toast.success('Receta eliminada exitosamente');
            fetchRecetas();
        } catch (error) {
            logApiError(`/recetas/${id}`, error);
            toast.error('Error al eliminar la receta');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Catálogo de Recetas</h2>
                        <p className="text-gray-600 mt-1">Recetas con información nutricional</p>
                    </div>
                    <Link to="/recetas/nuevo" className="btn-primary">
                        + Nueva Receta
                    </Link>
                </div>

                <div className="card">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar receta por nombre..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input-field"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : recetas.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No hay recetas registradas</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recetas.map((receta) => (
                                    <div key={receta.id_receta} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg">{receta.nombre}</h3>
                                                {receta.kcal && (
                                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                                        🔥 {receta.kcal} kcal
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-2xl">🍽️</span>
                                        </div>

                                        {receta.restricciones && (
                                            <div className="mb-3">
                                                <span className="text-xs text-gray-600">Restricciones:</span>
                                                <p className="text-sm text-red-600 mt-1">⚠️ {receta.restricciones}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex gap-2">
                                            <Link
                                                to={`/recetas/${receta.id_receta}/editar`}
                                                className="flex-1 text-center btn-secondary text-sm"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(receta.id_receta)}
                                                className="flex-1 text-center btn-danger text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginación */}
                            {lastPage > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border rounded disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-4 py-2">
                                        Página {currentPage} de {lastPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                                        disabled={currentPage === lastPage}
                                        className="px-4 py-2 border rounded disabled:opacity-50"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default RecetasIndex;
