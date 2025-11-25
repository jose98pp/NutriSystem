import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../config/api';

const AnalisisClinicosIndex = () => {
    const [analisis, setAnalisis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAnalisis();
    }, [search]);

    const fetchAnalisis = async () => {
        try {
            const response = await api.get('/analisis-clinicos', {
                params: { tipo: search }
            });
            setAnalisis(response.data.data.data || response.data.data);
        } catch (error) {
            console.error('Error al cargar análisis clínicos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este análisis clínico?')) {
            try {
                await api.delete(`/analisis-clinicos/${id}`);
                fetchAnalisis();
            } catch (error) {
                console.error('Error al eliminar análisis:', error);
                alert('Error al eliminar el análisis clínico');
            }
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Análisis Clínicos</h2>
                        <p className="text-gray-600 mt-1">Registro de análisis y estudios médicos</p>
                    </div>
                    <Link to="/analisis-clinicos/nuevo" className="btn-primary">
                        + Nuevo Análisis
                    </Link>
                </div>

                <div className="card">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar por tipo de análisis..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : analisis.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No hay análisis clínicos registrados</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {analisis.map((item) => (
                                <div key={item.id_analisis} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">🔬</span>
                                                <h3 className="font-bold text-lg">{item.tipo}</h3>
                                            </div>
                                            
                                            {item.evaluaciones && item.evaluaciones.length > 0 && (
                                                <div className="text-xs text-gray-600 mb-2">
                                                    Vinculado a {item.evaluaciones.length} evaluación(es)
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded mb-3">
                                        <span className="text-sm font-medium text-gray-700">Resultado:</span>
                                        <pre className="text-sm text-gray-800 mt-2 whitespace-pre-wrap font-mono">
                                            {item.resultado}
                                        </pre>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/analisis-clinicos/${item.id_analisis}/editar`}
                                            className="btn-secondary text-sm"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id_analisis)}
                                            className="btn-danger text-sm"
                                        >
                                            Eliminar
                                        </button>
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

export default AnalisisClinicosIndex;
